---
title: Go and JSON, various useful libraries and utilities
tags: go golang json libraries code
date: 2016-08-12
---

JSON is probably one of the most popular data interchange format on the web. Go
with its extensive standard library has good support for JSON. If your
requirements for JSON serialization and deserialization are not specific, I
highly recommend to simply start by using `"encoding/json"` from the standard
library and reading how it works ([blog](https://blog.golang.org/json-and-go),
[docs](https://golang.org/pkg/encoding/json/),
[examples](https://gobyexample.com/json)). Here I will give a few libraries for
JSON in Go and explain what differentiates them from "encoding/json"
and each other.


First, why would we want to use anything other than `"encoding/json"`? Well to
provide flexibility and simplicity in its usage, `"encoding/json"` makes use
of reflection on the structs that defines the structure of the JSON you are
expecting to serialize or deserialize and because of that it incurs a heavy
performance penalty.

What if we didn't have to reflect on a struct and simply insert data to a
`map[string]interface{}` object? Well `"encoding/json"` allows you to do that
but the resulting data structure ends up frustrating to work with, with casting
all over the place and is hard to navigate fluently.

## Structured Data

- [ffjson](https://github.com/pquerna/ffjson)
- [easyjson](https://github.com/mailru/easyjson)

To avoid reflection, these libraries provide a code generator to be run over
structs defining the structure of the JSON and fields in the same format as
`"encoding/json"`. The generated code is now the parsing code for the JSON
structure.

Both `ffjson` and `easyjson` provide a drop in replacement for `"encoding/json"`
which means that after generating code for parsing, you should be able to use
the same api calls as before but with `ffjson` or `easyjson`.

The advantage of this is that you now have specific parsing
code for the JSON structure you are expecting. This also gives a nice speed up
in the order of about **2 to 3 times faster** than `encoding/json`.

The disadvantage is that you will need to run the code generator every time you
change the struct defining the JSON structure. There is a simple fix for this
by using the `go generate` command and `//go:generate ffjson $GOFILE` at the top
of any files with the structs.

`easyjson` works very similarly to `ffjson` and claims to be more performant
and behave better when run concurrently.

## Deserializing Unstructured Data

- [jsonparser](https://github.com/buger/jsonparser)
- [gjson](https://github.com/tidwall/gjson)

`jsonparser` and `gjson` like `ffjson` and `easyjson` do not rely on
reflection but what differentiates them from the structured JSON libraries is
that instead of creating structs that defines the structure of the JSON to be
parsed these libraries read the value at a specific path you want.

By only reading values at paths specified, you only need to parse the part of
the data you are interested in. No need to parse the whole json eagerly. Users
of lazy functional languages will recognize here the value of lazy reading. This
allows these libraries to read even faster than `ffjson` and `easyjson`.

By not having to deserialize to a struct, these libraries can read directly from
the byte buffer which allows values to be read much faster than other
deserialization libraries.

Another advantage over `"encoding/json"`, is that the api is much more ergonomic
than unmarshalling the json into a `map[string]interface{}` since no casting
is necessary and walking to the specific field you want to read is much easier.
For example, here is how to read values using `"encoding/json"` with
`map[string]interface{}` vs `gjson`.

```go
// "encoding/json"
package main

import (
	"encoding/json"
)

const data = `{"name":{"first":"Janet","last":"Prichard"},"age":47}`

func main() {
	var values map[string]interface{}
	json.Unmarshal([]byte(data), &values)
	value := values["name"].(map[string]interface{})["last"].(string)
	printf(value)
}

// gjson
package main

import "github.com/tidwall/gjson"

const json = `{"name":{"first":"Janet","last":"Prichard"},"age":47}`

func main() {
    value := gjson.Get(json, "name.last")
    println(value.String())
}
```

The disadvantage of these libraries is that they only provide deserialization
and not serialization. For fast serialization, you can rely on the structured
data serializers.

## Utilities and other helpful libraries

### Convert JSON to a Go Struct
Instead of doing this job by hand, here are some utilities that can help you:

- Online: https://mholt.github.io/json-to-go/
- Locally: https://github.com/ChimeraCoder/gojson

## Summary
Useful JSON libraries:
For generating encoders and decoders:

- [ffjson](https://github.com/pquerna/ffjson)
- [easyjson](https://github.com/mailru/easyjson)

For reading unstructured json at a specific path:

- [jsonparser](https://github.com/buger/jsonparser)
- [gjson](https://github.com/tidwall/gjson)
