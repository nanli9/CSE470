//
// Rotating Square Demo
// This program demonstrates:
// -- animation
// -- event handling
// -- drawing different primitives (triangle strip, line, point)
// -- using different colors for each primitive
// (Code derived from Angel's texbook code)
// Dianne Hansford
//

// webgl context
var gl;

// initialize the object to not be rotated
var theta = 0.0;
var thetaLoc;

// direction is clockwise/counter-clockwise (latter is default)
var direction = true;

// control speed of rotation by changing increment of 
// theta rotation angle (in radians)
var deltaRadians = (3.149/4)/60.0;
// For fun: This setting results in 8 seconds for one rotation 
//   (Pi/4 radians/sec) / 60 fps = radians/frame

// Value for speed up or slow down; change deltaRadians by this
var speedIncrement = deltaRadians/2.0;

const radians2degrees = 90.0/3.14159;

// store the colors for the GPU
var colors = [];

// to allow rotation thru colors
var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(1.0, 1.0, 0.0)
    ];
var numcolors = 4;
var colorindex = 0;


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
	// viewport defines where in canvas to draw -- use it all
	// (0,0) is lower-left of canvas
    gl.viewport( 0, 0, canvas.width, canvas.height );
	
	// set background color to white; background cleared in render() with gl.clear()
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	// Define square vertices and line vertices
    var vertices = [
        vec2(  0,  1.0),
        vec2(  1,  0 ),
        vec2( -1,  0 ),
        vec2(  0, -1 ), // end of the square 
        vec2(  -0.6, -0.6), // 3 points to be connect with lines
        vec2(  0.6, 0.6),
        vec2( 0.6, -0.6),

    ];

	// initialize the colors for the square 
	// (using integer index into baseColors array)
	// also init color for black point and green line segment
	// (This function called again from event handler "ChangeColor"
	setcolors(colorindex);
	

    // Load the data into the GPU    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

	
	// do same for colors
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	// associate shader theta variable    
    thetaLoc = gl.getUniformLocation( program, "theta" );
	
	// *************** HTML DOM Interaction
    // Initialize event handlers
	
	// This handler changes a variable used in the render function
    document.getElementById("Direction").onclick = function () {
        direction = !direction;
    };

    // This example shows that sometimes you need to update the buffers
	document.getElementById("ChangeColor").onclick = function () {
        colorindex += 1;
        if(colorindex > numcolors-1) {colorindex = 0};
	    setcolors(colorindex);
	    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    };

    
    document.getElementById("Controls" ).onclick = function(event) {
		// change string to integer
		var icase = parseInt(event.target.value);
		
        switch( icase ) {	
          case 0:
            direction = !direction;
            break;
         case 1:  // faster
            deltaRadians += speedIncrement;
			console.log("set deltaRadians =",deltaRadians);
            break;
         case 2:  // slower
            deltaRadians -= speedIncrement;
			console.log("set deltaRadians =",deltaRadians);
            break;
       }
    };

    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1':
            direction = !direction;
            break;

          case '2':
            deltaRadians += speedIncrement;
			console.log("keyboard set deltaRadians =",deltaRadians);
            break;

          case '3':
            deltaRadians -= speedIncrement;
			console.log("keyboard set deltaRadians =",deltaRadians);
            break;
        }
    };
	
	window.onresize = function() {
		
		// find the minimum browser dimension
		var min = innerWidth;
		if(innerHeight < min) {
			min = innerHeight;
		}
		console.log("onresize");
		console.log("canvas width = ",canvas.width,"  height = ",canvas.height);
		console.log("innerWidth = ",innerWidth,"  innerHeight = ",innerHeight);
		console.log("min = ",min);
		
		// change the viewport if the resize interferes with the canvas
		// min dimension is new viewport dimension
		// place lower-left corner of viewport as high as possible
		// viewport is all or part of canvas.
		// (0,0) is lower-left of canvas
		
		if(min < canvas.width || min < canvas.height) {
			gl.viewport(0, canvas.height - min, min, min);
			// try this instead 
			//gl.viewport(0, 0, min, min);
			// also try commenting out both
			console.log("set viewport upper left location to (0,",canvas.height - min,")  ");
		}
		
	};
	
	console.log("Rotate at ", deltaRadians," radians per frame");
	console.log("  this is ",deltaRadians*radians2degrees,"  degrees per frame");
	console.log("  resulting in ",deltaRadians*radians2degrees*60.0,"degrees per second");
	console.log("speedIncrement is set to ",speedIncrement," = ",speedIncrement*radians2degrees," degrees ");
	
	
	
	// call recursive render function
    render();
};



// Set the color for each vertex sent to the GPU.
//
function setcolors(colorindex)
{
	// colors for the vertices of the square
colors = [
        baseColors[colorindex],
        baseColors[colorindex],
        baseColors[colorindex],
        baseColors[colorindex],
vec3(1, 1, 0.0),  // point color
vec3(0.2, 0.9, 0.3), // line color
vec3(0.2, 0.9, 0.3)
    ];
}


// Draw continuously
//
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

	// update the angle of rotation and send to vertex shader
    theta += (direction ? deltaRadians : -deltaRadians);
	
	// send updated value to GPU
    gl.uniform1f(thetaLoc, theta);

	// Using points 0 ... 3, draw triangle strip
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
    
    // Draw some other primitives

    gl.drawArrays(gl.POINTS, 0, 1); // one point on square
    gl.drawArrays(gl.POINTS, 4, 1); // new point  
    gl.drawArrays(gl.POINTS, 5, 1);// line vertices
    gl.drawArrays(gl.POINTS, 6, 1);
	
	// play here: try uncommenting out the next line  
	//gl.uniform1f(thetaLoc, 0.0);
    gl.drawArrays(gl.LINE_STRIP, 4, 3);   // line segment

	// Callback redraw
	
	requestAnimFrame(render);
	
}
 