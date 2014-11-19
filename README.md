# nzAccordiScroll
A superlative, scrolling accordion directive for AngularJS.  This ain't yo grandma's accordion...

## [Demo](http://codepen.io/tannerlinsley/pen/Eaxmwz)

## Install
1. `bower install nz-sweet-alert`
2. Include the `nzAccordiScroll.js` file
3. Include `nzAccordiScroll` as a dependency (i.e. in `app.js`)

Utilize Like So:

Basic Usage:
```html
<div nz-accordi-scroll>
    <stack>Stack 1</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
</div>
```
Custom Top/Bottom Max's:
```html
<div nz-accordi-scroll show-stacks="[4, 4]">
    <stack>Stack 1</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
</div>
```
Custom Collapse Size:
```html
<div nz-accordi-scroll show-stacks="0" collapse-size="10">
    <stack>Stack 1</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
</div>
```

Happy AccordiScrolling!