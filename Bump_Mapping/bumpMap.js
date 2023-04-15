

// to do:
// add mouse, add light point

var canvas;
var gl;
var program;

var texSize = 256;
var texCoordsArray = [];
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
var bumpNormals = new Uint8Array(3*texSize*texSize);

var numVertices  = 6;
var pointsArray = [];

var vertices = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0,  0.0,  0.0, 1.0 ),
    vec4( 1.0,  0.0,  1.0, 1.0 ),
    vec4( 0.0, 0.0,  1.0, 1.0 )
];

var modelViewMatrix, projectionMatrix, normalMatrix;

var eye = vec3(2.0, 2.0, 2.0);
var at = vec3(0.5, 0.0, 0.5);
var up = vec3(0.0, 1.0, 0.0);
    
// surface is just the xz plane, so normal is constant
var normal = vec4(0.0, 1.0, 0.0, 0.0);

// partial derivative in one of the parametric directions is called tangent
var tangent = vec3(1.0, 0.0, 0.0);

// light position in object coordinates
var lightPosition = vec4(0.0, 2.0, 0.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.2, 1.0, 0.7, 1.0 );

// control moving eye
var time = 0;


function configureTexture( myimage ) {
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, myimage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

// create mesh and assign texture coordinates

function mesh() {
     pointsArray.push(vertices[0]); 
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[1]); 
     texCoordsArray.push(texCoord[1]); 

     pointsArray.push(vertices[2]); 
     texCoordsArray.push(texCoord[2]); 
    
     pointsArray.push(vertices[2]); ;
     texCoordsArray.push(texCoord[2]); 

     pointsArray.push(vertices[3]); 
     texCoordsArray.push(texCoord[3]); 

     pointsArray.push(vertices[0]); 
     texCoordsArray.push(texCoord[0]);        
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);


    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    modelViewMatrix  = lookAt(eye, at, up);
    projectionMatrix = ortho(-0.75,0.75,-0.75,0.75,-5.5,5.5);
    
	 
	// the following 2 matrices will be the same since the modelview is orthogonal
	var normalMatrix = normalMatrixMat3(modelViewMatrix);
	
	var normalMatrix2 = mat4Tomat3(modelViewMatrix);
	
	console.log("modelViewMatrix = ",modelViewMatrix);
	console.log("normalMatrix = modelview? ",normalMatrix2);
	console.log("normalMatrix calculated = ",normalMatrix);
	
	// create mesh and assign texture coords
    mesh();
	
	// create the bump map and load into a texture
	// to do: choose one -- put choice in UI
	createBumpMapRectangle();
	//createBumpMapSinCos();
	configureTexture(bumpNormals);
    console.log(bumpNormals);
    console.log(pointsArray);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    


    var diffuseProduct = mult(lightDiffuse, materialDiffuse);

    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct));	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition));
    gl.uniform4fv( gl.getUniformLocation(program, "normal"),flatten(normal));
    gl.uniform3fv( gl.getUniformLocation(program, "objTangent"),flatten(tangent));

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
    gl.uniformMatrix3fv( gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMatrix));
    
	
    render(); 
}

render = function(){
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
    
    lightPosition[0] = 5.5*Math.sin(0.01*time);
    lightPosition[2] = 5.5*Math.cos(0.01*time);
    
    time += 1;
    
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
          
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    
    requestAnimFrame(render);
}
