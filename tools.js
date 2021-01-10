class Param
{
   constructor( obj )
   {
      this._obj = obj;
      for ( let k in obj )
      {
         this.set( k, this._obj[ k ] );
      }
   }
   get obj() { return this._obj; }

   has( key )
   {
      return this.obj ? hasOwnProperty.call( this.obj, key ) : false;
   }
   set( key, value = undefined )
   {
      if ( hasOwnProperty.call( this, key ) )
      {
         throw `Param already has property "${key}"`;
      }
      this[ key ] = value;
   }
   get( key, defaultValue = undefined )
   {
      return ( this.has( key ) ) ? this.obj[ key ] : defaultValue;
   }
   static create( obj )
   {
      return new Param( obj );
   }
}