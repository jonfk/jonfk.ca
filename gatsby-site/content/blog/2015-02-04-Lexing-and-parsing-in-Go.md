---
title: Lexing and parsing in Go (Part 1)
tags: learning golang go compiler language
date: 2015-02-04
---

_Note: all the code can be seen at [github.com/jonfk/calc](https://github.com/jonfk/calc)_

About a month ago, I watched a [video of Rob Pike](https://www.youtube.com/watch?v=HxaD_trXwRE)
giving a talk about lexing for the text/template/parse package. In it he described the simplicity
and elegance of making a traditionally not concurrent problem into a concurrent solution. This then
motivated me to try out making a lexer for a yet undefined language of my own design. But first as I
did in my implementation, let start with the lexer.

## Lexical Analysis

My quest started simply with a lexer. The idea behind the lexer is actually quite simple. The lexer
has a goroutine that runs the lexer and another that collects the tokens sent by the lexer. This setup
allows the lexer to be run in a very simple manner. Instead of having mutually recursive functions,
we have a for loop that runs functions set by the lexer. The for loop is as follows:

```go
// stateFn represents the state of the scanner as a function
// that returns the next state.
type stateFn func(*Lexer) stateFn

// run runs the state machine for the lexer.
func (l *Lexer) run() {
	for l.state = lexStart; l.state != nil; {
		l.state = l.state(l)
	}
}
```

As you will notice, l is a pointer to the lexer struct and lexStart is the first function passed to
the loop. The state field of the lexer holds a state function which is a function with the above
type signature. The state function returns another state function which will take care of the next
state and so on.The for loop then runs the current state until a state function returns nil. The run()
function is ran in a goroutine and communicates with the main goroutine through a channel

```go
// lex creates a new scanner for the input string.
func Lex(name, input string) *Lexer {
	l := &Lexer{
		name:  name,
		input: input,
		items: make(chan Token),
	}
	go l.run()
	return l
}
```

In the other goroutine, users of the lexer can make calls to NextItem() which returns the next
Token in the channel.

## Tokens

At this point, you would be right to wonder what exactly are we lexing, since we cannot lex tokens
we don't know. I started with the code from the
[text/template/parse package](http://golang.org/src/text/template/parse/lex.go)
and modified it to suit my needs. Tokens are defined as a struct with fields for the type, position
and value of the token.

```go
// token represents a token or text string returned from the scanner.
type Token struct {
	Typ TokenType // The type of this token.
	Pos Pos       // The starting position, in bytes, of this item in the input string.
	Val string    // The value of this item.
}
```

The TokenType is then an int defined with the const iota specs. e.g.

```go
const (
	ERROR TokenType = iota // error occurred; value is text of error
	BOOL                   // boolean constant
	EOF
	NEWLINE      // '\n'

        ...

	// Keywords appear after all the rest.
	KEYWORD // used only to delimit the keywords
	ELSE    // else keyword
	END     // end keyword
	IF      // if keyword
	THEN    // then keyword
	LET     // let keyword
	VAR     // var keyword
	VAL     // val keyword

	OPERATOR
	// Operators and delimiters
	ADD // +
	SUB // -
	MUL // *
	QUO // /
	REM // %

        ...
)
```

The TokenType is mapped to their string representation using a map.

```go
var key = map[string]TokenType{
	"else": ELSE,
	"end":  END,
	"if":   IF,
	"then": THEN,
	"let":  LET,
	"val":  VAL,
	"var":  VAR,
	"+":    ADD,
	"-":    SUB,
	"*":    MUL,
	"/":    QUO,
	"%":    REM,
	"&&":   LAND,
	"||":   LOR,
	"==":   EQL,
	"<":    LSS,
	">":    GTR,
	"=":    ASSIGN,
	"!":    NOT,
	"!=":   NEQ,
	"<=":   LEQ,
	">=":   GEQ,
}
```

A few other helper functions and methods are defined such as precedence(), IsLiteral(), Equals(), etc.

Next we will talk about the ast.
