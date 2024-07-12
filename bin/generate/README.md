# Flow of package and component scripts 

This documentation exists because of developing the two it became very messy in my head.. 

## Problem formulation 
so lets start by defining what the desired outcome is, 

the package script should be responsible for creating the package itself
it should receive a name and do the layer stuff 

once this is established, the package script should call the component script with a name in place 
(this name is the one used to create the package itself)

the full package name needs to be in place 
::full package name consists of "@project-scope/(layertype-)?name"

## Package Script 
need to establish 
1. layer-type 
2. package name 

## Component Script 
need to establish 
1. template-type 
2. component name 
3. class name (layer_name-component_name)
4. prefix - if template-type is of web-component
5. view - if template-type has view 
501. html-name
6. test - if template-type has test 

all the names be passed via flags 
1. component-name
2. class-name
3. html-name
