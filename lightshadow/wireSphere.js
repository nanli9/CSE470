
var canvas;
var gl;

// creation of the sphere
var numTimesToSubdivide = 3;
var numVertices = 0;
var pointsArray = [];

// define an ortho box
var near = -10;
var far = 10;
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

// eye location and parameters to move
var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 3,
    theta: 0,
    phi: 0
};


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
 
 
 
//=========== Geometry creation functions

function triangle(a, b, c) {
     pointsArray.push(a); 
     pointsArray.push(b); 
     pointsArray.push(c);     
     numVertices += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

// ================== Start program

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
	// Initialize 4 points on a sphere
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    
	// Create the sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	
	
	// report number of vertices and triangles to html page
	document.getElementById("numVertices").innerHTML="Number of vertices = " + numVertices;
	document.getElementById("numTris").innerHTML="Number of triangles = " + numVertices/3;
		

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    
	
	// define mouse event listeners
	mouseControls();
    
	// User interface to increase or decrease the number of subdivisions
    document.getElementById("buttonIncreaseSubdiv").onclick = function(){
        numTimesToSubdivide++; 
        numVertices = 0;
        pointsArray = []; 
        init();
    };
    document.getElementById("buttonDecreaseSubdiv").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        numVertices = 0;
        pointsArray = []; 
		init();
    };
	
	
	projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	
    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			 
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
            
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
        

    for( var i=0; i<numVertices; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );

    window.requestAnimFrame(render);


}
