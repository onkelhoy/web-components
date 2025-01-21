# Example Markdown File

This is an example markdown file that includes various aspects of markdown syntax.

## Links

Here's a link to [Google](https://www.google.com).

## Titles and Subtitles

### Level 3 subtitle

#### Level 4 subtitle

## Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed fringilla justo eget enim rhoncus semper. Proin tincidunt urna ac libero ultrices, eu feugiat nulla tincidunt. Nam semper sapien vitae eleifend congue. Sed eu nisl aliquam, gravida enim vel, euismod risus.

## Tables

| Column 1 Header | Column 2 Header |
| --------------- | --------------- |
| Row 1, Column 1 | Row 1, Column 2 |
| Row 2, Column 1 | Row 2, Column 2 |

## Logical

### Properties Table

| name   | default-value | type    | description                        |
| ------ | ------------- | ------- | ---------------------------------- |
| foo    | "bar"         | Foo     | This property is of type `Foo`     |
| bajs   | undefined     | number  | This property is of type `number`  |
| fooLaa | true          | boolean | This property is of type `boolean` |

### Events Table

| name       | type                      | description                                                |
| ---------- | ------------------------- | ---------------------------------------------------------- |
| main-click | `CustomEvent<ClickEvent>` | This event is dispatched when the main section is clicked. |

### Public Functions Table

| name            | arguments | description                                                                                                                                 |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| render          | None      | This function renders the `TestPage` component using `html` function from "@pap-it/system-utils" and returns the rendered HTML as a string. |
| handleMainClick | None      | This function dispatches a `CustomEvent` with type `ClickEvent` and detail `{foo: this.foo}` when the main section is clicked.              |

## Styling

### CSS Variables

The TestPage component uses the following CSS variables:

| Name                    | Default Value                      | Type     | Description                        |
| ----------------------- | ---------------------------------- | -------- | ---------------------------------- |
| --test-background-color | var(--colors-netural-white, white) | CSS unit | Background color of the component. |
| --test-text-color       | var(--colors-netural-black, black) | CSS unit | Text color of the component.       |

### Parts

The TestPage component exposes the following parts:

| Name   | Description                          |
| ------ | ------------------------------------ |
| header | The header element of the component. |
| footer | The footer element of the component. |

### Slots

The TestPage component has the following slots:

| Name    | Default Value                                                                      | Description                          |
| ------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| header  | `<h1>llama drama trauma</h1>`                                                      | The header content of the component. |
| default | `<p>Why did the llama go to therapy? Because it had a lot of spitting issues!</p>` | The main content of the component.   |
| footer  | `<p>Why did the llama enter the door? To attend the llamazing party inside!</p>`   | The footer content of the component. |

## Code

This is an example of inline `code`.

```python
# This is a Python code block
def hello_world():
    print(\"Hello, world!\")
```

`hello`

```html
<link rel="stylesheet" href="blabla.css" />
<p>Paragraph</p>
```

## Lists

### Unordered List

- Item 1
- Item 2
- Item 3

### Ordered List

1. First item
2. Second item
3. Third item

## Blockquotes

> This is an example of a blockquote. It can be used to highlight important information or quotes from other sources.
> Im also part of the block quote
> so am I

That's it! This is an example markdown file with various syntax elements.
