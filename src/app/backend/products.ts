export interface ProductSize {
  idsize?: number;
  idproducts?: number;
  taille: string;
  prix: number;
  stock?: number;
  buying_cost?: number;
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
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  sizes?: ProductSize[];
  highlighted?: boolean;
  onssa?: boolean;
  onssa_number?: string;
}
export interface count{
  count:Number;
}
