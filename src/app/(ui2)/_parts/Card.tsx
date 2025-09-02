export function Card({children, className=""}:{children:React.ReactNode; className?:string}) {
  return <div className={`border rounded-lg bg-white shadow-sm shadow-slate-100 ${className}`}>{children}</div>;
}
export function CardBody({children, className=""}:{children:React.ReactNode; className?:string}) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
export function CardHeader({children, className=""}:{children:React.ReactNode; className?:string}) {
  return <div className={`px-4 pt-4 ${className}`}>{children}</div>;
}
export function CardFooter({children, className=""}:{children:React.ReactNode; className?:string}) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}


// compat: add default export
export default Card;
