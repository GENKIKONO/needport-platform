import { FLAGS } from "../config/flags";
import { redirect } from "next/navigation";
export default function Page(){
  if (FLAGS.UI_V2_DEFAULT) redirect("/v2");
  return null;
}
