

var canvas;
var gl;

// sphere definition
var numTimesToSubdivide = 4;
var numVertices = 0;
var pointsArray = [];
var normalsArray = [];

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

// ortho box
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;

// sphere initial points
var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);
    
	
var lightPosition = vec4(2.0, 2.0, 2.0, 1.0 );
//var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );
//var lightPosition = vec4(0.0, 0.0, 1.0, 1.0 );
//var lightPosition = vec4(10.0, 0.0, 0.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;


// ====================== sphere definition
    
function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec3(normal);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     numVertices += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, false);
        ac = normalize(ac, false);
        bc = normalize(bc, false);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

// =================== run program 


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
    
	
	console.log("numTimesToSubdivide = ",numTimesToSubdivide);
	
	
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	console.log("ambient product = ",ambientProduct);

    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	
	// report number of vertices and triangles to html page
	document.getElementById("numVertices").innerHTML="Number of vertices = " + numVertices;
	document.getElementById("numTris").innerHTML="Number of triangles = " + numVertices/3;
	

	//console.log("normals[1] = ",normalsArray[1]);
	//console.log("points[1] = ",pointsArray[1]);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

     
	// define mouse event listeners
	mouseControls();
    
	// User interface to increase or decrease the number of subdivisions
    document.getElementById("buttonIncreaseSubdiv").onclick = function(){
        numTimesToSubdivide++; 
        numVertices = 0;
        pointsArray = []; 
		normalsArray = [];
        init();
    };
    document.getElementById("buttonDecreaseSubdiv").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        numVertices = 0;
        pointsArray = []; 
		normalsArray = [];
		init();
    };


    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

	projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	
    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
	       
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );  
        
    for( var i=0; i<numVertices; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
