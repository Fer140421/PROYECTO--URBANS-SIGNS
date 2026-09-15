import { People } from "../people/people.model";

export interface Supplier {
  idSupplier: number;
  people: People
  city:string;
  status: boolean;
}
