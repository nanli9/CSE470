
/*
Shaded sphere: Gouraud shading with exact normals

Things to try:
-- Play with the sliders in the HTML page
-- Change the light color and see how it interacts with the material.
-- Make the normal vectors crazy (see triangle() code change)
-- Intentionally create a normal vector error to see what that  looks like (see triangle() code)
-- Open the sphere (see tetrahedron() for code change)

-- In the vertex shader, if a certain condition is met, set the color to a color that is not in the normal palette.

-- Understand sphere construction
*/

var canvas;
var gl;
var program;

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

// choose between orth and perspective
var useOrtho = false;
// ortho box
var f = 3;
var left = -f;
var right = f;
var ytop = f;
var bottom = -f;
var near = 0.01;
// farFactor should be at least max dimension of object 
var farFactor = 3;
var far = viewer.radius * farFactor;

// perspective frustum
fov = 60.0;


// initialize for sphere created by repeated subdivision of tetrahedron

var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);


 
    
// light position in eye coordinates
// be sure in orth box if want yellow square to appear
//var lightPosition = vec4(1.5, 0.0, -3.0, 1.0 );
//var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
var lightPosition = vec4(-1.0, 1.0, -2.0, 1.0 );

//var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
//var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
// this green one is good to try with red ball (--> no ambient)
//var lightAmbient = vec4(0.0, 0.0, 0.2, 1.0 );

//var lightDiffuse = vec4( 0.0, 0.0, 0.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );

//var lightSpecular = vec4(  0.0, 0.0, 0.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );


// Material
 
 // copper 
/* 
var materialAmbient = vec4( 0.19125, 0.0735, 0.0225, 1.0 );
var materialDiffuse = vec4( 0.7, 0.27, 0.08, 1.0 );
var materialSpecular = vec4( 0.25, 0.13, 0.08, 1.0 );
var materialShininess = 1.0;
*/
 

// silver (and set shini to 1000
 /* 
var materialAmbient = vec4( 0.19225,0.19225,0.19225, 1.0 );
var materialDiffuse = vec4( 0.5754, 0.5754, 0.5754, 1.0 );
var materialSpecular = vec4( 0.0508273, 0.0508273, 0.0508273, 1.0 );
var materialShininess = 1000.0;
 */

// red material; try changing light color
 
var materialAmbient = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialShininess = 100.0; 
 
// create scaled versions of input materials
// copied below in init function
var mA = vec4( 0.0, 0.0, 0.0, 1.0 );
var mD = vec4( 0.0, 0.0, 0.0, 1.0 );
var mS = vec4( 0.0, 0.0, 0.0, 1.0 );
var mShini = 1.0;
// only copy original if initializing program
let programInit = true;


var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// =================== sphere creation
    
function triangle(a, b, c) {

     normalsArray.push(a);
     normalsArray.push(b);
     normalsArray.push(c);
	 
	 // play: comment out push c to see what happens when normals not matched with vertices
	 
	 // play: create an incorrect normal vector to see what happens
	 // comment out push c above
	 /*
	 var rnum = 0.5* Math.random();
	 var playnormal = vec3(c[0]+ rnum, c[1]+ rnum, c[2]+ rnum);
	 playnormal = normalize(playnormal, false);
	 normalsArray.push(playnormal);
	 */
	  
     
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
                
		
		// normalize 3d vector
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
	// comment out next line to create an open object
    divideTriangle(a, c, d, n);
}

// ================== run program

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
	
    gl.enable(gl.DEPTH_TEST);
	
	// play with turning culling on/off (sphere is open)
	//gl.enable(gl.CULL_FACE);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

	// create scaled versions of input materials
	// These will be used; keep original for scaling
	if(programInit) {
		for(var i=0; i<4; i++) {
			mA[i] = materialAmbient[i];
			mD[i] = materialDiffuse[i];
			mS[i] = materialSpecular[i];
		}
		mShini = materialShininess;
		programInit = false;
		console.log("Initializing the material properties");
	}
	else
		console.log(" NOT Initializing the material properties");
	

    ambientProduct = mult(lightAmbient, mA);
    diffuseProduct = mult(lightDiffuse, mD);
    specularProduct = mult(lightSpecular, mS);

	console.log("Ambient products = ",ambientProduct);
	console.log("Diffuse products = ",diffuseProduct);
	console.log("Specular products = ",specularProduct);
    
	// create sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	console.log("computed sphere  numVertices = ",numVertices);
	 
	// report number of vertices and triangles to html page
	document.getElementById("numVertices").innerHTML="Number of vertices = " + numVertices;
	document.getElementById("numTris").innerHTML="Number of triangles = " + numVertices/3;
	
	// report light location
	document.getElementById("lightLocation").innerHTML="Light location (in eye coordinates) = " + lightPosition[0].toFixed(2) + ", " + lightPosition[1].toFixed(2) + ", " + lightPosition[2].toFixed(2);
	
	// report material properties to page
	reportMaterials();
	
	
	// load the light
	var l3d = vec3(lightPosition[0], lightPosition[1],lightPosition[2]);
	pointsArray.push(l3d); 
	// not used, but size should match points
	normalsArray.push(1.0, 0.0, 0.0); 
	
	
	//console.log("pointsArray ",pointsArray);
	
	

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
	console.log("vNormal = ",vNormal);
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
	
// material sliders
	document.getElementById("ambientSlider").onchange = function() {
        var materialAmbScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			mA[i] = materialAmbScale * materialAmbient[i];
		console.log("new materialAmbient = ",mA);
		ambientProduct = mult(lightAmbient, mA);
		gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
	   reportMaterials();
    };
	
	document.getElementById("diffuseSlider").onchange = function() {
        var materialDiffScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			mD[i] = materialDiffScale * materialDiffuse[i];
		
		console.log("Diffuse scale = ",materialDiffScale);
		console.log("new materialDiffuse = ",mD);
		diffuseProduct = mult(lightDiffuse, mD);
		gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct));
		reportMaterials();
	};
	
	document.getElementById("specularSlider").onchange = function() {
        var materialSpecScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			mS[i] = materialSpecScale * materialSpecular[i];
		console.log("new materialSpecular = ",mS);
		specularProduct = mult(lightSpecular, mS);
		gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct));
	   reportMaterials();
    };
	
	document.getElementById("shiniSlider").onchange = function() {
        var materialShiniScale = event.srcElement.value;
		mShini = materialShiniScale * materialShininess;
		console.log("new materialShininess = ",mShini);
		gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),mShini ); 
	   reportMaterials();
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
       "shininess"),mShini ); 
	   
	
	   
	console.log("light position = ",lightPosition);

	if(useOrtho)
		projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	else
		projectionMatrix = perspective(fov, 1.0, near, far);
	
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	
    render();
}

function reportMaterials() {
	// report material properties to page
	document.getElementById("diffuseScale").innerHTML = "material diffuse = " + mD[0].toFixed(2) + ", " + mD[1].toFixed(2) + ", " + mD[2].toFixed(2);
	document.getElementById("ambientScale").innerHTML = "material ambient = " + mA[0].toFixed(2) + ", " + mA[1].toFixed(2) + ", " + mA[2].toFixed(2);
	document.getElementById("specularScale").innerHTML = "material specular = " + mS[0].toFixed(2) + ", " + mS[1].toFixed(2) + ", " + mS[2].toFixed(2);
	document.getElementById("shiniScale").innerHTML = "material shininess = " + mShini.toFixed(2);
}	
	
function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    
	gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 1);
        
    for( var i=0; i<numVertices; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );
	 
	// draw the light -- it is given in eye coords
	modelViewMatrix = mat4();
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform1i( gl.getUniformLocation(program, "colorFlag"),0 );
	gl.drawArrays( gl.POINTS, numVertices, 1);

    window.requestAnimFrame(render);
}
