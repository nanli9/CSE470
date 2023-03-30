//
// simpleSquare.js
//
// Demonstration of a webgl program built with html and javascript.
// This program displays a square.
// Also needed: simpleSquare.html and the Common folder (and files)
//

// global variable for the drawing area and webgl context
var canvas;
var gl;

var justOne = 0;
 
// When all the files have been read, the window system call the init function that holds our program
// This is an example of an event listener/handler
window.onload = function init()
{
	// document is refering to the document object model (DOM)
	// This allows us to communicate with the HTML web page
	// We are creating a short name for the canvas/drawing space
    canvas = document.getElementById( "gl-canvas" );
    
	// set up to use webgl in the canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	// webgl functions start with "gl." indicating that they belong to the canvas
	
	// Define part of canvas to draw to using viewport
    // Lower-left in canvas is (0,0) 
	// and grab width and height from HTML document
    gl.viewport( 0, 0, canvas.width, canvas.height);
	// Try this: divide the width and height in half
	
	// background color of canvas
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	//  Load shaders (defined in GLSL code in HTML file)
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	// We will use these shaders from now on
    gl.useProgram( program );
    
	
	// This is the best way to debug -- print to the browser console (F12 to open)
	console.log("create vertices array");
	
	//  Create the square 
	//(The order of the vertices is a little unusual. Explained in render() function below)
	// To start, we will define coordinates within [-1,1] in x and y
	
    var vertices = [
        vec2(0, 1.0),
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1)
    ];

	// Here is an example of how to debug with print statements
	// Hit F12 in the browser to open the debug window
	console.log("vertices = ",vertices);
	console.log("vertex[0] = ",vertices[0]);
	console.log("vertex[0][0] = ",vertices[0][0]);
	console.log("vertex[0][1] = ",vertices[0][1]);

    
    // Load the data into the GPU
	// Create memory (buffer) to hold data -- here vertices
	// Bindbuffer identifies that "bufferId" is vertex information
	// Takes 2d vertices and flattens them into a 1d array
	// gl.STATIC_DRAW is an example of a webgl constant
	//    It means we intend to specify data once here and use repeatedly for webgl drawing
	//
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
	// Note that in the vertex shader, the vertex is called vPosition.
	// The var here is the same name to keep the association simple, but it is not necessary
	// 2d points being loaded
	//
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // draw 

    justOne = 0;
	render();
	
    /* this is a little play to demo double buffering that occurs when call render -- revisit after doublebuffer ppt */
	/*
	console.log("displayed initially -- wait  and do again")
	setTimeout(function(){render();}, 5000);
	console.log("did it");
	*/
};


function render() {
	
	// clear the background
	// another example of a webgl constant - it is a bitmask
	// it will clear using the color defined in gl.clearColor
    
    gl.clear( gl.COLOR_BUFFER_BIT );

	// draw using vertices already loaded in the GPU 
	// here we draw two triangles 0,1,2 and 1,2,3
    
	gl.drawArrays( gl.TRIANGLES, 0, 3 ); 
	gl.drawArrays( gl.TRIANGLES, 1, 3 ); 
	
	// NOTE: if we want to use one drawArrays call, we should
	// send the points to the gpu
	// 0 1 2 1 2 3
	//then call gl.drawArrays( gl.TRIANGLES, 0, 6 );
	// this is more like what you would really do
    	
	
	
	// this is an option drawing also
	// a little tricky: 0,1,2 then 1,2,3
	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4);
	   
	// this method does not work with the vertex organization
	//gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	// Not needed in this program -- this is needed for animation
    //window.requestAnimFrame(render);
}
