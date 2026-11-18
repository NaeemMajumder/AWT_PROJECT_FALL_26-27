import { Request } from "express";
import {
  FindManyOptions,
  FindOneOptions,
  FindOperator,
  ILike,
  In,
  LessThanOrEqual,
  Raw,
} from "typeorm";

interface CustomFindManyOptions extends FindManyOptions {
  select?: any;
  relations?: {
    [index: string]: any;
  };
}

interface CustomFindOneOptions extends FindOneOptions {
  select?: any;
  relations?: {
    [index: string]: any;
  };
}

function operationParser(
  operation: string,
  value: string,
): FindOperator<any> | string | number {
  if (operation == "ltei") {
    return LessThanOrEqual(parseInt(value));
  } else if (operation == "lte") {
    return LessThanOrEqual(value);
  } else if (operation == "in") {
    return In(JSON.parse(value));
  }
  return value;
}

const makeFindOption = function (
  query: any,
  search_fields: string[],
): FindManyOptions | undefined {
  if (!query) return undefined;
  if (query.filters)
    throw { message: "Invalid Query String. filters is a reserved word" };
  const findOption: CustomFindManyOptions = {};
  let { q, attributes, include, limit, offset, sortBy, ...filters } = query;

  if (attributes) {
    try {
      attributes = JSON.parse(attributes.toString()) as string;
    } catch (err) {}
    findOption.select = {};
    let selects: any = [];
    if (!Array.isArray(attributes) && typeof attributes !== "object")
      attributes = attributes.toString().split(",");
    if (!Array.isArray(attributes) && typeof attributes === "object") return;
    selects = attributes;
    selects.map((element: string) => {
      findOption.select = findOption.select ?? {};

      const [levelOne, levelTwo, levelThree] = element.toString().split(".");
      findOption.select[levelOne] = findOption.select[levelOne] ?? true;
      if (levelTwo) {
        findOption.select[levelOne] =
          findOption.select[levelOne] != true
            ? findOption.select[levelOne]
            : {};
        findOption.select[levelOne][levelTwo] = true;
        if (levelThree) {
          findOption.select[levelOne][levelTwo] =
            findOption.select[levelOne][levelTwo] != true
              ? findOption.select[levelOne][levelTwo]
              : {};
          findOption.select[levelOne][levelTwo][levelThree] = true;
        }
      }
    });
  }
  if (sortBy) {
    findOption.order = {};
    try {
      sortBy = JSON.parse(sortBy.toString()) as string;
    } catch (err) {}
    if (sortBy && !Array.isArray(sortBy)) {
      sortBy = [sortBy.toString()];
    }
    const s = sortBy as string[];
    s.map((sort) => {
      const [field, order] = sort.toString().split(":");
      findOption.order = {
        ...findOption.order,
        [field]: order == "desc" ? "desc" : "asc",
      } as any;
    });
  }
  if (offset) {
    try {
      offset = JSON.parse(offset.toString()) as string;
    } catch (err) {}
    const skip = offset;
    if (Array.isArray(skip)) {
      findOption.skip = parseInt(skip[0] as string);
    } else {
      findOption.skip = parseInt(skip as string);
    }
  }
  if (limit) {
    try {
      limit = JSON.parse(limit.toString()) as string;
    } catch (err) {}
    const take = limit;
    if (Array.isArray(take)) {
      findOption.take = parseInt(take[0] as string);
    } else {
      findOption.take = parseInt(take as string);
    }
  }
  if (q) {
    const whereClauses: any[] = [];
    try {
      q = JSON.parse(q.toString()) as string;
    } catch (err) {}
    const searchTerms = Array.isArray(q) ? q : [q];

    searchTerms.forEach((search) => {
      let [field, value] = search.toString().split(":");
      if (value && search_fields.includes(field)) {
        whereClauses.push({ [field]: ILike("%" + value + "%") });
      } else if (!value) {
        value = field;
        search_fields.forEach((sField) => {
          whereClauses.push({ [sField]: ILike("%" + value + "%") });
        });

        if (
          search_fields.includes("first_name") &&
          search_fields.includes("last_name")
        ) {
          whereClauses.push({
            first_name: Raw(
              (alias) =>
                `(${alias} || ' ' || ${alias.replace(
                  "first_name",
                  "last_name",
                )}) ILIKE :value`,
              { value: `%${value}%` },
            ),
          });
        }
      }
    });
    findOption.where = whereClauses;
  }
  if (filters) {
    const parsedFilters: { [index: string]: any } = {};
    Object.keys(filters).map((field) => {
      let value = filters[field] ?? "";
      if (Array.isArray(value)) value = value[0];
      const [opOrVal, val] = value.toString().split(":");
      let comparingValue;
      if (!val) {
        comparingValue = opOrVal;
      } else {
        comparingValue = operationParser(opOrVal, val);
      }
      const [levelOne, levelTwo, levelThree] = field.toString().split(".");
      parsedFilters[levelOne] = comparingValue;
      if (levelTwo && levelTwo != "column") {
        parsedFilters[levelOne] = {};
        parsedFilters[levelOne][levelTwo] = comparingValue;
        if (levelThree) {
          parsedFilters[levelOne][levelTwo] = {};
          parsedFilters[levelOne][levelTwo][levelThree] = comparingValue;
        }
      }
    });
    if (!findOption.where) {
      findOption.where = { ...parsedFilters };
    } else {
      findOption.where = findOption.where.map((where: any) => {
        return {
          ...where,
          ...parsedFilters,
        };
      });
    }
  }
  if (include) {
    try {
      include = JSON.parse(include.toString());
    } catch (err) {}
    findOption.relations = {};
    let relations: any = [];
    if (!Array.isArray(include) && typeof include !== "object")
      include = include?.toString().split(",");
    if (!Array.isArray(include) && typeof include === "object") return;
    relations = include;
    relations.forEach((element: string) => {
      if (!findOption.relations) findOption.relations = {};
      const [firstLevel, secondLevel] = element.split(".");
      findOption.relations = {
        ...findOption.relations,
        [firstLevel]: secondLevel
          ? {
              ...findOption.relations[firstLevel],
              [secondLevel]: true,
            }
          : (findOption.relations[firstLevel] ?? true),
      } as any;
    });
  }
  return findOption;
};

const makeFindOneOption = function (query: any): FindOneOptions | undefined {
  if (!query) return undefined;
  const findOption: CustomFindOneOptions = {};
  let { attributes, include } = query;

  if (attributes) {
    try {
      attributes = JSON.parse(attributes.toString()) as string;
    } catch (err) {}
    findOption.select = {};
    let selects: any = [];
    if (!Array.isArray(attributes) && typeof attributes !== "object")
      attributes = attributes.toString().split(",");
    if (!Array.isArray(attributes) && typeof attributes === "object") return;
    selects = attributes;
    selects.map((element: string) => {
      findOption.select = findOption.select ?? {};

      const [levelOne, levelTwo, levelThree] = element.toString().split(".");
      findOption.select[levelOne] = findOption.select[levelOne] ?? true;
      if (levelTwo) {
        findOption.select[levelOne] =
          findOption.select[levelOne] != true
            ? findOption.select[levelOne]
            : {};
        findOption.select[levelOne][levelTwo] = true;
        if (levelThree) {
          findOption.select[levelOne][levelTwo] =
            findOption.select[levelOne][levelTwo] != true
              ? findOption.select[levelOne][levelTwo]
              : {};
          findOption.select[levelOne][levelTwo][levelThree] = true;
        }
      }
    });
  }
  if (include) {
    try {
      include = JSON.parse(include.toString());
    } catch (err) {}
    findOption.relations = {};
    let relations: any = [];
    if (!Array.isArray(include) && typeof include !== "object")
      include = include?.toString().split(",");
    if (!Array.isArray(include) && typeof include === "object") return;
    relations = include;
    relations.forEach((element: string) => {
      if (!findOption.relations) findOption.relations = {};
      const [firstLevel, secondLevel] = element.split(".");
      findOption.relations = {
        ...findOption.relations,
        [firstLevel]: secondLevel
          ? {
              ...findOption.relations[firstLevel],
              [secondLevel]: true,
            }
          : (findOption.relations[firstLevel] ?? true),
      } as any;
    });
  }
  return findOption;
};

export { makeFindOption, makeFindOneOption };
