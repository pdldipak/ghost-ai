We need the base chrome components that frame every editor screen - top navbar and the left sidebar shell. These will be reused and extend in every chapter that follows. 

### Editor Navbar 

Create `components/editor/editor-navbar.tsx`

Requirements: 
- fixed-height top navbar
- left, center, and right sections
- left section contains sidebar toggle button 
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- right section stays empty for now 
- dark background with subtle bottom border 

### Project Sidebar 

Create `components/editor/project-sidebar.tsx`

Requirememnts: 

- sidebar should float above the editor canvas
- opening it should not push page content 
- slides in from the left 
- accept `isOpen` prop  `close` props
- header with `Projects` title + close button 
- shadcn `Tabs`: 
  - My Projects
  - Shared
- both tabs show empty placeholder state 
- full-width `New Project` button at the bottom with `Plus` icon 

### Dialog Pattern 

Use theexsting cor tokens from `global.css` for dialg styling. 

Support: 

- title 
- descriptin
- footer actions 

Do not build actual dialogs yet. 

### Check when done 

- new components compile without TypeScript errors 
- no lint errors
- dialog patterns is ready for futures use 

