# generate script 

The start of it all, 

this create script has 3 main parts 
(more might come who knows)

1. create a new package 
2. create a sub-package 
3. create new project 

## Creating a new **package** 

This is creating with flexibility in mind, 
it scans the current "packages" folder to determine which "categories/layers" to show 
the developer. This is because in most cases we want to reuse those to create further packages to them 
but sometimes we want to create new "categories/layers". 

Each "categories/layers" will come with a config.env where certain rules are set
example, if its name should appear in the package itself (example: "button-atom" | "button")
but also if the name should be different from the folder name, 
example folder name: "atoms" and the used name can be "atom" - notice the plural (s) on the foldername. 

then the process is simple, 
1. get name for package 
2. check if package already exists or not 
3. copy over template files 
4. init new package into system 

## Crearting a new **sub package**

Creating a new sub package is pretty streight forward, 
1. first we need to figure out which package is the target
2. we then copy over the template files 
3. last we update target package to include the the sub-package 

## Creating new project 

This mode exists for so we can simply create a new project with the entire structure (omitting packages and themes)
