---
layout: post
title: A simple protocol for a TCP chat server and client
tags: learning golang tcp networking example tutorial
---

## Introduction
I will be talking about some motivating factors for why you would want to use a
lower level networking protocol such as TCP and how you could implement your own
application protocol over it.


### Some prerequisites
- a general understanding of networking
- a Go distribution


## Motivation
Dealing with an HTTP API such as a RESTful web API is often the easier way to
interact with your server. Applications that only need to consume and send
commands to the server asynchronously can fit this use case. But some applications such
as a chat client or a game server need a 2-way method of communication between the client and
server. This is accomplished by using a lower level protocol such as TCP or UDP.

We can think of TCP and UDP as a pipe between 2 endpoints and at each end of the connection we have
a stream of bytes that can be read. I will note here that TCP is in this analogy a reliable pipe whereas
we can consider UDP as a faster but unreliable pipe between the endpoints. Further detail about the differences
of TCP and UDP are beyond the scope of this post, but I encourage you to do some research to learn more since networking
has some very leaky abstractions nad understanding the layer underneath is always useful in debugging issues such as
outages, latency and any properties you would like to have.


## How can we use tcp
Now that we know what we can use to have a continuous stream of data to communicate between 2 endpoints,
how can we actually used that stream of bytes? We first need a way to interpret that stream of bytes so
that we can read the messages passed on there.

There are several ways to do it:
- We could use a set number of bytes
- We could use sentinel values to mark the beginning and/or end of a message
- Something else(let's come back to this)


### The pros and Cons
Pros of using a set number of bytes:
- Size of buffer to allocate for the message does not change and is known in advance
- Data in the message can be arbitrary and does not need to be escaped

Cons of using a set number of bytes:
- Can be wasteful. What if we need to send 8 bytes but we are using 1024 byte buffers
- Hard to extend. Once we declare the protocol we cannot change the number of bytes in messages

Pros of using sentinel values
- Easy to implement. Read until we see the sentinel value.
- Flexible in how much data we can send.

Cons of using sentinel values
- We cannot use the sentinel values in our data. We need to carefully escape the data to be sent.

## Is there a better option?
Glad you asked.

We could define a protocol that specifies how much data to be sent by using the set number of bytes
scheme. This essentially ends up being a header. We could define a protocol that sets the number of bytes
for the header which always needs to be sent followed by the message body.

A simple example of using this scheme would be to have a 4 byte message for a 32bit int which would
describe the length of the message followed by the message. This will allow us to allocate a buffer of that
size and read until we receive all the bytes promised in the header.

This negates the wastefulness of the fixed number of bytes scheme, but it still makes it hard to extend this
protocol without breaking backwards compatibility. For example, in our simple example protocol, we can send
a maximum of 4GB in our messages. (4 bytes = 4*8 = 32 bits; 2^32-1 = 4294967295 bytes = 4.29497 GB)

## Lets use this to implement a simple chat server and client
Using this scheme we can wrap the `net.Conn` `Read` method in a helper function as follows:

```go
func ReadMsg(conn net.Conn) (string, error) {
	// Make a buffer to hold length of data
	lenBuf := make([]byte, 4)
	_, err := conn.Read(lenBuf)
	// Receiving EOF means that the connection has been closed
	if err == io.EOF {
		// Close conn and exit
		conn.Close()
		fmt.Println("Connection Closed. Bye bye.")
		os.Exit(0)
	}
	if err != nil {
		return "", err
	}
	lenData := FromBytes(lenBuf)

	// Make a buffer to hold incoming data.
	buf := make([]byte, lenData)
	reqLen := 0
	// Keep reading data from the incoming connection into the buffer
        // until all the data promised is received
	for reqLen < int(lenData) {
		tempreqLen, err := conn.Read(buf[reqLen:])
		reqLen += tempreqLen
		if err == io.EOF {
			return "", fmt.Errorf("Received EOF before receiving all promised data.")
		}
		if err != nil {
			return "", fmt.Errorf("Error reading: %s", err.Error())
		}
	}
	return string(buf), nil
}
```

What this does is read 4bytes from the specified connection and converts those bytes to an int. It then reads
from the connection until it has seen as many bytes from the connection as was promised in the header. The `FromBytes` function
takes care of converting the bytes to the int. In our protocol, the int are encoded in binary in Big Endian as is common
in most networking protocol which is why big endian is also known as *The Network Byte Order*. Here is the helper functions to
convert ints to and from bytes:

```go
// To convert Big Endian binary format of a 4 byte integer to int32
func FromBytes(b []byte) int32 {
	buf := bytes.NewReader(b)
	var result int32
	err := binary.Read(buf, binary.BigEndian, &result)
	if err != nil {
		log.Fatal(err)
	}
	return result
}

// To convert an int32 to a 4 byte Big Endian binary format
func ToBytes(i int32) []byte {
	buf := new(bytes.Buffer)
	err := binary.Write(buf, binary.BigEndian, i)
	if err != nil {
		log.Fatal(err)
	}
	return buf.Bytes()
}
```

Similarly for the write:

```go
func WriteMsg(conn net.Conn, msg string) {
	// Send the size of the message to be sent
	conn.Write([]byte(ToBytes(int32(len([]byte(msg))))))
	// Send the message
	conn.Write([]byte(msg))
}
```

We write the size of the message and then the message.

Now lets use these in a server:

```go
func main() {
	// Listen for incoming connections.
	l, err := net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		os.Exit(1)
	}
	// Close the listener when the application closes.
	defer l.Close()
	fmt.Println("Listening on " + CONN_HOST + ":" + CONN_PORT)
	for {
		// Listen for an incoming connection.
		conn, err := l.Accept()
		if err != nil {
			fmt.Println("Error accepting: ", err.Error())
			os.Exit(1)
		}
		// Handle connections in a new goroutine.
		go handleRequest(conn)
	}
}

// Handles incoming requests.
func handleRequest(conn net.Conn) {
	// Close the connection when you're done with it.
	defer conn.Close()

	msg, err := common.ReadMsg(conn)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Message Received: %s\n", msg)
	// Send a response back to person contacting us.
	common.WriteMsg(conn, "Message Received.")
}
```

Here we setup the server to listen for connections at a given port and handle the connection
when we receive one. You will notice we are closing the connection as soon as we send a reply,
but this is not necessary and we could listen for several messages depending on your application.

On the client side:

```go
func main() {
	tcpAddr, err := net.ResolveTCPAddr("tcp", CONN_HOST+":"+CONN_PORT)
	if err != nil {
		log.Fatal(err)
	}

	// Connect to server through tcp.
	conn, err := net.DialTCP("tcp", nil, tcpAddr)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	go printOutput(conn)
	writeInput(conn)
}

func writeInput(conn *net.TCPConn) {
	fmt.Println("Enter text:")
	for {
		// Read from stdin.
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("> ")
		text, _ := reader.ReadString('\n')
		common.WriteMsg(conn, text)
	}
}

func printOutput(conn *net.TCPConn) {
	for {

		msg, err := common.ReadMsg(conn)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(msg)
	}
}
```

We first connect to the server and the same port our server is listening to and set a goroutine
to print all messages we receive from the connection, if the connection is closed we exit. On another
thread of execution we listen for input on stdin and write messages to the connection.


And Voila. We have a client chatting with our server.

## Concluding remarks
You will probably notice we are not handling the errors and simply exit on failure on any errors in this
example. Don't do that in your code. I just wanted to keep my example simple here. In an actual program,
we would return err in the function that has one and the top-level would handle them.

You can now extend this example to send more meaningful things that just strings. Interesting things
such as XML or JSON or Protobuf.

The full example is available [HERE](https://github.com/jonfk/golang-chat/tree/b2cfd296bd40d85068b8a4105c9e6b2b30213168)