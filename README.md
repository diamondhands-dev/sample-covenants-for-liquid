# sample-covenants-for-liquid

```
npm install
```

```
npm run build
```

```
node dist/index.js
```

customFinalizer needs to be passed to finalizer in liquidjs-lib/src/finalizer.js
```
const customFinalizer = (inIndex, pset) => {
  const input = pset.inputs[inIndex];
  if (input.isTaproot()) {
    const stack = [input.tapLeafScript[0].script, input.tapLeafScript[0].controlBlock];
    return {
      finalScriptWitness: (0, utils_1.witnessStackToScriptWitness)(stack),
    };
  }
};
```
