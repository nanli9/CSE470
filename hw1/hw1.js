var canvas;
var gl;
var offset=vec4(0.1,0.1,0.1,0.1);
var justOne = 0;
var deltaRadians = (3.14/4)/120;
// store the colors for the GPU

// to allow rotation thru colors
var thetaLoc;
var offsetLoc;
var theta=0.0;
var alpha=0.0;
var colors = [
    ];
	for(i=0;i<60;i=i+3)
	{
		let x=Math.random();
		let y=Math.random();
		let z=Math.random();
		colors.push(vec3(x, y, z));
		colors.push(vec3(x, y, z));
		colors.push(vec3(x, y, z));
	}

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
		vec2(0,0),
		vec2(0.2,0)		
    ];
	
	var numberofVertices=20;
	var angle=2*Math.PI/numberofVertices;
	var radius=0.2;
	for(i=1;i<=numberofVertices;i++){
		vertices.push(vec2(radius*Math.cos(angle*i),radius*Math.sin(angle*i)))
	}
	
	    
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

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	// associate shader offset variable 	
	offsetLoc = gl.getUniformLocation( program, "offset" );
	// associate shader theta variable    
    thetaLoc = gl.getUniformLocation( program, "theta" );
    

    justOne = 0;
	render();
	
    
};
function render() {
	
	
    
    gl.clear( gl.COLOR_BUFFER_BIT );
	gl.uniform4f(offsetLoc, 1,1,0,0);
	
	theta += deltaRadians;
	gl.uniform1f(thetaLoc, theta);
	
	var angle=2*Math.PI/10;
	var radius=0.8;
	for(i=0;i<10;i++)
	{
		gl.uniform4f(offsetLoc, radius*Math.cos(angle*i),radius*Math.sin(angle*i),0,0);
		gl.drawArrays( gl.TRIANGLE_FAN, 0, 23); 
	}

	gl.uniform4f(offsetLoc,0,0,0,0)
	alpha -= deltaRadians;
	gl.uniform1f(thetaLoc, alpha);
	gl.drawArrays( gl.TRIANGLE_FAN, 0, 23); 
	requestAnimFrame(render);
	
}
