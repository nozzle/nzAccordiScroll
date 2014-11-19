# nzAccordiScroll
A superlative, scrolling accordion directive for AngularJS.  This ain't yo grandma's accordion...

## [Demo](http://codepen.io/tannerlinsley/pen/vEEZgZ)

## Install
1. `bower install nz-accordi-scroll`
2. Include the `nzAccordiScroll.js` file
3. Include `nzAccordiScroll` as a dependency (i.e. in `app.js`)
4. For basic styling tips, see the demo/example

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
<div nz-accordi-scroll show-stacks="[4, 4]" or show-stacks="4">
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
<div nz-accordi-scroll collapse-size="10">
    <stack>Stack 1</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
    <stack>Stack 2</stack>
    Some Content...
</div>
```

Happy AccordiScrolling!
