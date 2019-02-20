Web Component Tester Test Result Converter to JUnit
====================================================

Generates junit reports.

## Installation

```sh
npm install wct-test-result-converter-junit --saveDev
```

## Basic Usage

Add the following configuration to web-component-tester's config file (wct.conf.json).

```json
{
  "plugins": {
    "wct-test-result-converter-junit": {
        "output": "./test-results/junit-testfile.xml"
    }
  }
}
```

## Result

    output -> ./test-results/junit-testfile.xml
