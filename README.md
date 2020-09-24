# Coming soon

## Packaging and developing locally

For development purposes, you can use `yarn link` to have a local React app point to a local version of this project.

The only catch: You may run into the [infamous error 13991](https://github.com/facebook/react/issues/13991) if you just yarn link this package alone.

**Step 1**

Instead, you'll need to `yarn link` this project _and_ its copy of React, like this:

```
cd decode-client
yarn link
yarn install
cd node_modules/react
yarn link
cd YOUR_PROJECT
yarn link @decode/client
yarn link react
```

After following those steps, `YOUR_PROJECT` should be using the _local_ copy of @decode/client.

(h/t: https://github.com/facebook/react/issues/14257#issuecomment-595183610)

**Step 2**

Whenever you make changes to `@decode/client`, you'll need to build it for it to be picked up by YOUR_PROJECT.

However, `yarn build` does an `rm -rf dist/`, which can crash a local dev server of eg Create React App. So instead, you can run:

```
yarn build-dev
```

This will _not_ `rm -rf dist/` first, but instead overwrite files with new ones. This may result in some strangeness over time. Eg, if you rename a file, I believe the old file will still stick around in `dist/`. So if you're seeing strangeness, just run `yarn build`.
