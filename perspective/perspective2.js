

var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];
 
 /*
var vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4( 0.5, -0.5, 0.5, 1.0) 
];
 */

var vertices = [
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0),
    vec4(0.5,  0.5,  0.5, 1.0),
    vec4(0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4(0.5,  0.5, -0.5, 1.0),
    vec4( 0.5, -0.5, -.5, 1.0) 
];


var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];





var radius = 3.0;
var theta  = 0.0;
var phi    = 0.0;
// delta radians for y-movement (change to theta)
var dr = 5.0 * Math.PI/180.0;

// better programming: add information about minmax box of object
var near = 0.1;
var far = 6.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var eye = vec3(0.0, 0.0, radius);



var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;



function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);     
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]);  
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function printEyeInfo() {
	console.log();
	console.log("theta = ",theta,"  phi = ",phi);
	var newEye =  vec3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius *Math.cos(theta));
	console.log("eye = ",newEye);
}

function printPerspInfo() {
	console.log("znear = ",near,"  far = ",far);
	console.log("fov = ",fovy);
}

// ********************************************
// *********************************************

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	
	setEye();
	
	console.log("Initial viewing parameter ");
	console.log("eye = ",eye,"  at = ",at," up = ",up);
	console.log("on +z axis looking at origin ");
	console.log("Initial znear = ",near,"  far = ",far);
	console.log("Initial fov = ",fovy);
	
	// Report values to the page
	reportToPage();

// sliders for viewing parameters

    document.getElementById("zFarSlider").onchange = function() {
        far = event.srcElement.value;
		printPerspInfo();
		reportToPage();
    };
    document.getElementById("zNearSlider").onchange = function() {
        near = event.srcElement.value;
		printPerspInfo();
		reportToPage();
    };
    document.getElementById("radiusSlider").onchange = function() {
       radius = event.srcElement.value;
	   printEyeInfo();
	   reportToPage();
    };
    document.getElementById("thetaSlider").onchange = function() {
        theta = event.srcElement.value* Math.PI/180.0;
		printEyeInfo();
		reportToPage();
    };
    document.getElementById("phiSlider").onchange = function() {
        phi = event.srcElement.value* Math.PI/180.0;
		printEyeInfo();
		reportToPage();
    };
    document.getElementById("aspectSlider").onchange = function() {
        aspect = event.srcElement.value;
		reportToPage();
    };
    document.getElementById("fovSlider").onchange = function() {
        fovy = event.srcElement.value;
		printPerspInfo();
		reportToPage();
    };

    render();
}

function reportToPage() {
	// toFIxed input
	const f = 2;
	
	document.getElementById("reportAt").innerHTML = "At point = " + at[0].toFixed(f) + ", " + at[1].toFixed(f) + ", " + at[2].toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	
	document.getElementById("reportUp").innerHTML = "Up vector = " + up[0].toFixed(f)  + ", " + up[1].toFixed(f) + ", " + up[2].toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	
	document.getElementById("reportEye").innerHTML = "Eye point = " + eye[0].toFixed(f) + ", " + eye[1].toFixed(f) + ", " + eye[2].toFixed(f) + " ";
	
	document.getElementById("reportRadius").innerHTML = "Camera radius (|| at - eye||) = " + radius + "&nbsp&nbsp&nbsp&nbsp";
	
	document.getElementById("reportTheta").innerHTML = "Theta = " + theta.toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	
	document.getElementById("reportPhi").innerHTML = "Phi = " + phi.toFixed(f) + " ";
	
	
	document.getElementById("reportFOV").innerHTML = "fov = " + fovy +  "&nbsp&nbsp&nbsp&nbsp";
	
	document.getElementById("reportNF").innerHTML = "Near = " + near + "&nbsp&nbsp Far = " + far + "&nbsp&nbsp&nbsp&nbsp";
	
	document.getElementById("reportAspect").innerHTML = "Aspect ratio = " + aspect  + "&nbsp&nbsp&nbsp&nbsp";
	
}

// use global radius, theta, and phi
function setEye() {
	eye = vec3(radius * Math.sin(theta) * Math.cos(phi), 
        radius * Math.sin(theta) * Math.sin(phi), radius *Math.cos(theta));
}


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
     	
    setEye();
		 
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
            
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	
	// draw 2 reference points
	gl.drawArrays(gl.POINTS, 1,1);
	gl.drawArrays(gl.POINTS, 11,1);
	
    requestAnimFrame(render);
}

