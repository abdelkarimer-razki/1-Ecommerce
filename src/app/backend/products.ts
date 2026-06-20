export interface ProductSize {
  idsize?: number;
  idproducts?: number;
  taille: string;
  prix: number;
}

export interface products{
  idproducts:Number;
  name:string;
  picture:string;
  description:string;
  prix:Number;
  categorie:string;
  mangable:boolean;
  prixf:Number;
  taille:string;
  taille2:string;
  taille3:String;
  prix2:Number;
  prix3:Number;
  sizes?: ProductSize[];
  highlighted?: boolean;
}
export interface count{
  count:Number;
}
