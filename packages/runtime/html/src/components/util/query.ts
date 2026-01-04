// export enum State {
//   Tag,
//   Class,
//   Attribute,
//   Text,
//   Child,
//   Descendant,
//   Sibling,
// }

// type Token = {
//   type: State,
//   value: string|null;
// }

// function Tokenise(query: string) {
//   let state: State|null = null;

//   let currentValue:string|null = null;

//   const tokens:Token[] = [];

//   const emit = () => {
//     if (!state) return;
//     tokens.push({ type: state, value: currentValue });
//   }

//   for (let i=0; i<query.length; i++)
//   {
//     const char = query[i];
    
//     if (char === "+")
//     {
//       emit();
//       state = State.Sibling;
//       currentValue = null;
//       emit();
//       state = null;
//       continue;
//     }
//     if (char === ">")
//     {
//       emit();
//       state = State.Child;
//       currentValue = null;
//       emit();
//       state = null;
//       continue;
//     }
//     if (char === " ")
//     {
//       const next = query[i + 1];
//       if (/[\w|\.|\{|\[]/.test(next)) 
//       {
//         emit();
//         state = State.Descendant;
//         currentValue = null;
//         emit();
//         state = null;
//       } 
//       continue;
//     }

//     if (state === null)
//     {
//       switch (char) 
//       {
//         case ".":
//           state = State.Class;
//           break;
//         case "{":
//           state = State.Text;
//           break;
//         case "[":
//           state = State.Attribute;
//           break;
//         default:
//           state = State.Tag;
//           break;
//       }
//     }

//     switch (state) 
//     {
//       case State.TagStart:
//         if (char)
//       case State.Tag:
//         if (char === "+")
//         {
//           emit();

//         }
//         else if (char === ".") 
//           state = State.Class;
//         else if (char === "{")
//           state = State.Text;
//         else if (char === "[")
//           state = State.Attribute
//         else currentValue += char;
//         break;
      
//       case State.Class:
//         if (char === "{")
//           state = State.Text;
//         else if (char === "[")
//           state = State.Attribute
//         else currentValue += char;
//     }
//   }
// }

// type Query = {
//   tag?: string;
//   class?: string;
//   attribute?: { name: string, value: string|true };
//   id?: string;
//   text?: string;
//   sibling?: Query;
//   child?: Query;
// }
// export function getQuery(query:string): Array<Query> {
//   // const splitted = query.match(/([^[ |\>|+]]+)/g);

//   const tokens = Tokenise(query);

//   // now we build our query output 

//   // include child and sibling (sibling only to the right)

//   // type Output = 
//   // something like Array<{tag?: string, class?: string, attribute?: { name: string, value: string|true }, id?: string, sibling: }


//   return query
//     .split(/[ |\>|+]/)
//     .filter(Boolean)
//     .map(value => {
//       const match = value.match(/(?<tag>\w+)?(\.(?<class>\w+))?(?<id>#\w+)?(?<attribute>\[[^\]]+\])?(?<text>\{[^\}]+\})?/);
//       if (!match) return null;

//       const attrib = match?.groups?.attribute?.split("=");
//       return {
//         tag: match?.groups?.tag,
//         class: match?.groups?.class,
//         text: match?.groups?.text,
//         id: match?.groups?.id?.replace("#", ""),
//         attribute: attrib ? { name: attrib[0], value: attrib[1] ?? true } : undefined,
//       };
//     })
//     .filter(v => v !== null)
// }