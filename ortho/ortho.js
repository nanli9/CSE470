

var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 ),
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
var near = 0.01;
var far = radius * 2;


// Instead of hardcoding these values, 
// a better method would be to compute a minmax box
// and then expand it by some percentage
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;


var mvMatrix, pMatrix;
var modelView, projection;
var eye;

// These can be calculated
// up is tricky -- need to know something about geometry
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// quad uses first index to set color for face

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

// Each face determines two triangles

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
	var newEye =  vec3(radius * Math.sin(phi), radius * Math.sin(theta), radius * Math.cos(phi));
	console.log("eye = ",newEye);
};


// ***************************************
// ******************************************


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
	
	eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta), 
             radius*Math.cos(phi));
	console.log("Initial viewing parameter ");
	console.log("eye = ",eye,"  at = ",at," up = ",up);
	console.log("on +z axis looking at origin ");
	
	// Report values to the page
	reportToPage();
	

// buttons to change viewing parameters

	// ortho near and far
    document.getElementById("Button1").onclick = function(){
		near  *= 1.1; far *= 1.1;
		console.log("Increase near and far: near = ",near," far = ",far);
		reportToPage();
		};
    document.getElementById("Button2").onclick = function(){
		near *= 0.9; far *= 0.9;
		console.log("Decrease near and far: near = ",near," far = ",far);
		reportToPage();
		};
	
	// change eye position
    document.getElementById("Button3").onclick = function(){
		radius *= 1.1;
		printEyeInfo();
		reportToPage()
		};
    document.getElementById("Button4").onclick = function(){
		radius *= 0.9;
		printEyeInfo();
		reportToPage();
		};
    document.getElementById("Button5").onclick = function(){
		theta += dr;
		printEyeInfo();
		reportToPage()
		};
    document.getElementById("Button6").onclick = function(){
		theta -= dr;
		printEyeInfo();
		reportToPage()
		};
    document.getElementById("Button7").onclick = function(){
		phi += dr;
		printEyeInfo();
		reportToPage()
		};
    document.getElementById("Button8").onclick = function(){
		phi -= dr;
		printEyeInfo();
		reportToPage()
		};
       
    render();
}

function reportToPage() {
	// toFIxed input
	const f = 2;
	var reportAt = document.getElementById("reportAt").innerHTML = "At point = " + at[0].toFixed(f) + ", " + at[1].toFixed(f) + ", " + at[2].toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	var reportUp = document.getElementById("reportUp").innerHTML = "Up vector = " + up[0].toFixed(f)  + ", " + up[1].toFixed(f) + ", " + up[2].toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	var reportEye = document.getElementById("reportEye").innerHTML = "Eye point = " + eye[0].toFixed(f) + ", " + eye[1].toFixed(f) + ", " + eye[2].toFixed(f) + " ";
	
	var reportRadius = document.getElementById("reportRadius").innerHTML = "Camera radius (|| at - eye||) = " + radius.toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	
	var reportTheta = document.getElementById("reportTheta").innerHTML = "Theta = " + theta.toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	var reportPhi = document.getElementById("reportPhi").innerHTML = "Phi = " + phi.toFixed(f) + " ";
	
	
	var reportLR = document.getElementById("reportLR").innerHTML = "Left = " + left.toFixed(f) + "&nbsp&nbsp Right = " + right.toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	var reportTB = document.getElementById("reportTB").innerHTML = "Top = " + ytop.toFixed(f) + "&nbsp&nbsp Bottom = " + bottom.toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	var reportNF = document.getElementById("reportNF").innerHTML = "Near = " + near.toFixed(f) + "&nbsp&nbsp Far = " + far.toFixed(f) + "&nbsp&nbsp&nbsp&nbsp";
	
}

var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
        eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta),  radius * Math.cos(phi));

        mvMatrix = lookAt(eye, at , up); 
        pMatrix = ortho(left, right, bottom, ytop, near, far);
        
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
            
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        requestAnimFrame(render);
    }
