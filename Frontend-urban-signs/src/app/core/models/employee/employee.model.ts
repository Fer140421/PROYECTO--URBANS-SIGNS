import { People } from "../people/people.model";


export interface Employee {
  id_employee?: number;
  people: People;
  hireDate: string; // o Date si quieres convertirlo luego
  salary: number;
  status: boolean;
}
