import { IsIn } from "class-validator";
import { BD_DISTRICTS } from "@/common/constants/districts.constant";

export function IsBdDistrict() {
  return IsIn(BD_DISTRICTS, { message: "district must be one of the 64 districts of Bangladesh" });
}
