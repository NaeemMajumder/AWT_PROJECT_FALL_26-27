import { dataSourceOptions } from "@/config/.";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export const truncateTables = () => {
  console.log(`Clearing Tables.....`);
  const ds = new DataSource({
    ...dataSourceOptions,
  } as PostgresConnectionOptions);
  return ds
    .initialize()
    .then(async () => {
      try {
        const entities = ds.entityMetadatas;
        for (const entity of entities) {
          const repository = ds.getRepository(entity.name);
          await repository.clear();
        }
        console.log("All tables cleared");
      } catch (err) {
        console.error(err);
      }
    })
    .catch((err) => console.error(err));
};
