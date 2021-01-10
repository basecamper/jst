const HTML_ENTITY_PARAM = {
   PARENT : "parent",
   CHILD : "child",
   CHILDREN : "children",
   ON_RUN : "onRun",
   TYPE : "type",
   ID : "id",
   STYLE : "style",
   TEXT : "text",
   CLASS : "class",
   ON : "on",
   ON_CLICK : "onClick",
   INPUT_TYPE : "inputType",
   PLACEHOLDER : "placeholder",
   CHECKED : "checked",
   CHECKED_CLASS : "checkedClass",
   UNCHECKED_CLASS : "uncheckedClass"
};

class HTMLEntityException
{
   constructor( msg )
   {
      this.message = msg;
   }
}
class HTMLInputEntityException extends HTMLEntityException {}


class JSTHE_HasHTMLElement
{
   constructor( param )
   {
      if ( ! param.has( HTML_ENTITY_PARAM.TYPE ) ) throw new HTMLEntityException( "No type given!" );
      
      this._htmlElement = document.createElement( param.get( HTML_ENTITY_PARAM.TYPE ) );
      this.children = [];
      
      if ( param.has( HTML_ENTITY_PARAM.ID ) ) this.element.id = param.get( HTML_ENTITY_PARAM.ID );
      if ( param.has( HTML_ENTITY_PARAM.STYLE ) ) this.element.style = param.get( HTML_ENTITY_PARAM.STYLE );
      if ( param.has( HTML_ENTITY_PARAM.TEXT ) ) this.text = param.get( HTML_ENTITY_PARAM.TEXT );
   }
   get element() { return this._htmlElement; }
   set text( text ) { this.element.innerHTML = text; }
   get text() { return this.element.innerHTML; }
}
class JSTHE_HasChildren extends JSTHE_HasHTMLElement
{
   constructor( param )
   {
      super( param );
      this._children = [];
      this._parent = undefined;
      
      if ( param.has( HTML_ENTITY_PARAM.PARENT ) ) this.addChild( param.parent );
      if ( param.has( HTML_ENTITY_PARAM.CHILD ) ) this.addChild( param.child );
      if ( param.has( HTML_ENTITY_PARAM.CHILDREN ) ) this.addChildren( param.children );
   }
   
   set children( children ) { this._children = children; }
   get children() { return this._children; }
   set parent( parent ) { this._parent = parent; }
   get parent() { return this._parent; }
   
   addChild( child )
   {
      if ( child instanceof JSTHE_HasChildren )
      {
         this.children.push( child );
         child.parent = this;
         this.element.appendChild( child.element );
      }
      else throw new HTMLEntityException( "child not of class HasChildren!" );
      return this;
   }
   addChildren( children )
   {
      children.forEach(e => { this.addChild( e ) });
      return this;
   }
   empty()
   {
      this.children.forEach((c) => { c.removeFrom( this.children );
                                     this.element.removeChild( c.element );
                                     c.empty(); });
      return this;
   }
   removeFrom( arr )
   {
      let index = arr.indexOf( this );
      if ( index > -1 )
      {
         arr.splice( index, 1 );
      }
      return this;
   }
   pushTo( arr )
   {
      arr.push( this );
      return this;
   }
}
class JSTHE_Runable extends JSTHE_HasChildren
{
   constructor( param )
   {
      super( param );
      this._onRun = param.get( HTML_ENTITY_PARAM.ON_RUN );
   }
   run()
   {
      if( this._onRun )
      {
         this._onRun( this );
      }
      for ( c in this.children )
      {
         c.run();
      }
   }
}
class JSTHE_HasHTMLClass extends JSTHE_Runable
{
   constructor( param )
   {
      super( param );
      if ( param.has( HTML_ENTITY_PARAM.CLASS ) ) this.addClass( param.get( HTML_ENTITY_PARAM.CLASS ) );
   }
   hasClass( className )
   {
      return this.element.classList.contains( className );
   }
   addClass( className )
   {
      const splitted = className.split(" ");
      for ( const s in splitted )
      {
         if ( ! this.hasClass( className ) )
         {
            this.element.classList.add( className );
         }
      }
      return this;
   }
   removeClass( className )
   {
      const splitted = className.split(" ");
      for ( s in splitted )
      {
         if ( this.hasClass( className ) )
         {
            this.element.classList.remove( className );
         }
      }
      return this;
   }
   toggleClass( className )
   {
      const splitted = className.split(" ");
      for ( s in splitted )
      {
         if ( this.hasClass( className ) )
         {
            this.removeClass( className );
         }
         else
         {
            this.addClass( className );
         }
      }
      return this;
   }
}
class JSTHE_IsInteractive extends JSTHE_HasHTMLClass
{
   constructor( param )
   {
      super( param );
      if ( param.has( HTML_ENTITY_PARAM.ON ) ) this.addEventListeners( param.get( HTML_ENTITY_PARAM.ON ) );
      if ( param.has( HTML_ENTITY_PARAM.ON_CLICK ) ) this.addEventListener( "click", param.get( HTML_ENTITY_PARAM.ON_CLICK ) );
   }
   
   addEventListener( key, proc )
   {
      this.element.addEventListener( key, proc );
   }
   
   addEventListeners( listeners )
   {
      for ( let key in listeners )
      {
         this.addEventListener( key, listeners[key] );
      }
   }
}
class JSTHE_HasInput extends JSTHE_IsInteractive
{
   constructor( param )
   {
      super( param );
      if ( param.has( HTML_ENTITY_PARAM.INPUT_TYPE ) ) this.element.type = param.get( HTML_ENTITY_PARAM.INPUT_TYPE );
      if ( param.has( HTML_ENTITY_PARAM.PLACEHOLDER ) ) this.element.placeholder = param.get( HTML_ENTITY_PARAM.PLACEHOLDER );
   }
   get inputValue() { return this.element.value; }
}
class JSTHE_IsCheckable extends JSTHE_HasInput
{
   constructor( param )
   {
      super( param );
      
      this._checked = param.get( HTML_ENTITY_PARAM.CHECKED );
      this._checkedClass = param.get( HTML_ENTITY_PARAM.CHECKED_CLASS );
      this._uncheckedClass = param.get( HTML_ENTITY_PARAM.UNCHECKED_CLASS );
      
      if( this._checked != undefined )
      {
         const self = this;
         this.applyCheckedClasses();
         this.addEventListener( "click", function() { self._onClickSwitchChecked() } );
      }
   }
   
   get checked() { return this._checked; }
   set checked( state = ! this._checked ) { this._checked = state; }
   get checkedClass() { return this._checkedClass; }
   get uncheckedClass() { return this._uncheckedClass; }
   
   _onClickSwitchChecked()
   {
      this.checked = ! this.checked;
      this.applyCheckedClasses();
   }
   
   _setCheckedClasses( toAdd, toRemove )
   {
      if( toAdd )
      {
         this.addClass( toAdd );
      }
      if( toRemove )
      {
         this.removeClass( toRemove );
      }
   }
   
   applyCheckedClasses()
   {
      this._setCheckedClasses( this.checked ? this.checkedClass : this.uncheckedClass,
                               this.checked ? this.uncheckedClass : this.checkedClass );
   }
}

class HTMLEntity extends JSTHE_IsCheckable
{
   constructor( param )
   {
      console.debug( "Constructing with param", param );
      super( ( param instanceof Param ) ? param : new Param( param ) );
   }
}