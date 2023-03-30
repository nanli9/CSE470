
var canvas;
var gl;

var points = [];
var colors = [];

// Play with zbuffer
// 0 = off and triangles drawn in order sent to GPU
// 1 = on
// see points definition: can move one triangle in z easily
var zbuffFlag = 1;

var RED = 0;
var GREEN = 1;
var BLUE = 2;
var YELLOW = 3;



window.onload = function init()
{
    //
    //  Create data
    //

    // 9 vertices for 3 triangles
    // colored red, green, blue, resp.
	// each of these has a constant z-depth.
    // Can move red triangle with zval setting
    // 4th triangle (yellow) cuts across z-space

    var zval = -0.6;
    
    points = [
     // red
        vec3(  0.5000,  0.5000,zval),
        vec3(  -0.5000,  0.5,  zval),
        vec3( 0.5, -0.5, zval),

     // green
        vec3(  0.5000,  0.8000, -0.5),
        vec3(  -0.5000,  0.8,  -0.5),
        vec3( 0.5, -0.5, -0.5),

     // blue
        vec3(  0.6000,  0.6000, 0.9),
        vec3(  -0.7000,  0.8,  0.9),
        vec3( 0.5, -0.5, 0.9),

     // yellow -- runs z from -1 to 1

        vec3(  0.5000,  -0.5000, -0.9),
        vec3(  0.3000,  0.6,  0.0),
		vec3( -0.55, 0.75, 1.0)

    ];

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(1.0, 1.0, 0.0)
    ];

    //  triangle red
    colors.push( baseColors[RED] );
    colors.push( baseColors[RED] );
    colors.push( baseColors[RED] );

   //   triangle green
   colors.push( baseColors[GREEN] );
   colors.push( baseColors[GREEN] );
   colors.push( baseColors[GREEN] );

	//   triangle blue
   colors.push( baseColors[BLUE] );
   colors.push( baseColors[BLUE] );
   colors.push( baseColors[BLUE] );

	//   triangle yellow
   colors.push( baseColors[YELLOW] );
   colors.push( baseColors[YELLOW] );
   colors.push( baseColors[YELLOW] );

     // Give details in the console
    if(zbuffFlag === 1) {
		console.log("Initializing data");
		console.log("Z buffer is on");
	}
    else {console.log("Z buffer is off");}

    console.log("Three triangles parallel to xy-plane");
    console.log("Red   z = ",points[0][2]);
    console.log("Green z = ",points[3][2]);
    console.log("Blue  z = ",points[6][2]);
    console.log("Yellow z vals = ",points[9][2],points[10][2],points[11][2]);
    console.log("***** Draw order: red, green, blue, yellow");


    //
    //  Configure WebGL
    //
	
	canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


	// Enable Z-buffering
	if(zbuffFlag == 1) {
		console.log("Turn on z-buffering with enable DEPTH_TEST");
		document.getElementById("zBufferButton").innerHTML = "Z-buffer ON";
		gl.enable(gl.DEPTH_TEST);
	}
	else {
		console.log("z-buffering Off");
		document.getElementById("zBufferButton").innerHTML = "Z-buffer OFF";
	}

	// button event handler
    //enable or disable hidden-surface removal
	document.getElementById("zBufferButton" ).onclick = function() {
        if(zbuffFlag == 1) {
			zbuffFlag = 0;
			gl.disable(gl.DEPTH_TEST);
            console.log("control: turn off z buffer ");
			document.getElementById("zBufferButton" ).innerHTML = "Z-buffer OFF";
		}
		else {
            zbuffFlag = 1;
            gl.enable(gl.DEPTH_TEST);
            console.log("control: turn on z buffer ");
			document.getElementById("zBufferButton" ).innerHTML = "Z-buffer ON";
		}
         
    };

    
   
    render();
};


function render()
{
	// set mask to include z-buffer if flag to use set
    if(zbuffFlag === 1){
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);}
    else {
		gl.clear( gl.COLOR_BUFFER_BIT );
	}

    gl.drawArrays( gl.TRIANGLES, 0, points.length );

	requestAnimFrame(render);

}
