 

var canvas;
var gl;
var program;
// sphere definition

var numVertices = 0;
var numPoints = 0;
var pointsArray = [];
var normalsArray = [];
var tangentArray = [];
var indexPoints=[];
var indexNormals=[];
var texCoordsArray = [];

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

//animation var
var animation;
var kft = 0.0;
var stepsize = 0.005;
var pos=vec3(0,0,0);
var moveVector = vec3(0,0,-1)
var speed = 0.0;
var scale_x,scale_y,scale_z;
var animationToggle=false;
var jumpHeight = 0.4;
var hit = false;
var hitCounter = 0;
var numHit = 3;


var pi=3.14;
// ortho box
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;

var texture_object;
var texture_plane;
     
// light position is defined in eye coordinates
var lightPosition = vec4(0.0, 0.0, 3.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.2, 1.0, 0.7, 1.0 );

//store normal map
var texSize = 256;
var bumpNormals = new Uint8Array(3*texSize*texSize);

//matrix 
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1,1),
    vec2(1, 0)
];
var vertices = [
    vec3( 0.0, 0.0, 0.0 ),
    vec3( 1.0,  0.0,  0.0),
    vec3( 1.0,  0.0,  1.0),
    vec3( 0.0, 0.0,  1.0 )
];
var planePoints=[
    vec3( -0.8, -0.5,  0.8),
    vec3( -0.8,  -0.55,  0.8),
    vec3( 0.8,  -0.55,  0.8),
    vec3( 0.8, -0.5,  0.8),
    vec3( -0.8, -0.5, -0.8),
    vec3( -0.8,  -0.55, -0.8),
    vec3( 0.8,  -0.55, -0.8),
    vec3( 0.8, -0.5, -0.8)
]
function mesh() {
    pointsArray.push(vertices[0]);
    normalsArray.push(vec3(0,-1,0)); 
    tangentArray.push(vec3(1.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[1]);
    normalsArray.push(vec3(0,-1,0)); 
    tangentArray.push(vec3(1.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[1]); 

    pointsArray.push(vertices[2]);
    normalsArray.push(vec3(0,-1,0));
    tangentArray.push(vec3(1.0, 0.0, 0.0)); 
    texCoordsArray.push(texCoord[2]); 
   
    pointsArray.push(vertices[2]); 
    normalsArray.push(vec3(0,-1,0)); 
    tangentArray.push(vec3(1.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[2]); 

    pointsArray.push(vertices[3]); 
    normalsArray.push(vec3(0,-1,0)); 
    tangentArray.push(vec3(1.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[3]); 

    pointsArray.push(vertices[0]); 
    normalsArray.push(vec3(0,-1,0)); 
    tangentArray.push(vec3(1.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[0]);        
}
function quad(a,b,c,d){
    pointsArray.push(planePoints[a]); 
    normalsArray.push(vec3(0,0,0));
    tangentArray.push(vec3(0.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(planePoints[b]); 
    normalsArray.push(vec3(0,0,0));
    tangentArray.push(vec3(0.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(planePoints[c]); 
    normalsArray.push(vec3(0,0,0));
    tangentArray.push(vec3(0.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(planePoints[a]); 
    normalsArray.push(vec3(0,0,0));
    tangentArray.push(vec3(0.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(planePoints[c]); 
    normalsArray.push(vec3(0,0,0));
    tangentArray.push(vec3(0.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(planePoints[d]);
    normalsArray.push(vec3(0,0,0));
    tangentArray.push(vec3(0.0, 0.0, 0.0));
    texCoordsArray.push(texCoord[3]);
}
function drawPlane(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}
function configureTexturePlane( myimage ) {
    texture_plane = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_2D, texture_plane );
	// demo: comment out; gif image needs flip of y-coord
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, myimage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
}

function configureTextureObject( myimage ) {
    texture_object = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture_object);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, myimage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
}

// ==================== run program
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
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    drawTorus();
    
    drawPlane();

    mesh();
    

    modelViewMatrix = lookAt(viewer.eye, viewer.at, viewer.up);

    normalMatrix = normalMatrixMat3(modelViewMatrix);
	
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(indexPoints)), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(indexPoints), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var normal = gl.getAttribLocation( program, "normal" );
    gl.vertexAttribPointer( normal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normal );

    var iBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, iBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tangentArray), gl.STATIC_DRAW );
    
    var tangent = gl.getAttribLocation( program, "objTangent" );
    gl.vertexAttribPointer( tangent, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( tangent );

    var diffuseProduct = mult(lightDiffuse, materialDiffuse);

    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct));	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition));
    
    


    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    // define mouse event listeners
	mouseControls();
    
	
    document.getElementById("animation").onclick = function(){
        console.log("toggle animation");
        if(animationToggle){
            animationToggle=false;
            speed = 0.005;
        }
        else{
            animationToggle=true;
            speed = 0.00;
        }
        
        
    };
   
	
    
   
    var image = new Image();
	image.crossOrigin = "anonymous";
	image.src = window.Cartoon_green_texture_grass_data_url;
    image.onload = function() { 
        configureTexturePlane( image );
    }
    //createBumpMapRectangle();
    createBumpMapSinCos();
	configureTextureObject(bumpNormals);
    console.log(tangentArray);
    
    render();
}

function goUp(height){

}   
function goDown(){

} 

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(viewer.eye, viewer.at, viewer.up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    //draw plane
    gl.uniform1i(gl.getUniformLocation(program,"planeColorFlag"), 1);
    gl.uniform1i(gl.getUniformLocation(program,"planeFlag"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.drawArrays( gl.TRIANGLES, 121, 36 );
   

    //draw object
    gl.uniform1i(gl.getUniformLocation(program,"planeColorFlag"), 0);
    gl.uniform1i(gl.getUniformLocation(program,"planeFlag"), 0);
    
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
    
    
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0 );

    gl.drawArrays( gl.TRIANGLES, 157, 6 );
    
    window.requestAnimFrame(render);
}
