
var canvas;
var gl;


// quad texture coordinates

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0)
];

// quad vertices -- making 2 triangles

var vertices = [
    vec2( -0.5, -0.5 ),
    vec2(  -0.5,  0.5 ),
    vec2(  0.5, 0.5 ),
    vec2( 0.5, 0.5 ),
    vec2(  0.5,  -0.5 ),
    vec2(  -0.5, -0.5 )
];
    
// triangle vertices (used to make a texture map )

var pointsArray = [
    vec2(-0.5, -0.5), 
    vec2(0, 0.5), 
    vec2(0.5, -0.5) 
];


var program1, program2;
var texture1;

var framebuffer, renderbuffer;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    
// Create an empty texture that will be loaded with an image (64x64)

    texture1 = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.bindTexture(gl.TEXTURE_2D, null);


// Allocate a frame buffer object (memory same size as fb)

   framebuffer = gl.createFramebuffer();
   gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);

// Allocate memory to hold contents of fb
   renderbuffer = gl.createRenderbuffer();
   gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

// Attach color buffer
// texture1 is the name of the texture created above

   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);


// check for completeness

   var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
   if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');

    //
    //  Load shaders and initialize attribute buffers
    //
    program1 = initShaders( gl, "vertex-shader1", "fragment-shader1" );
    program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    
	// use program to create image red triangle on a gray background
    gl.useProgram( program1 );
        
    
    // Create and initialize a buffer object with triangle vertices
    
    var buffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    // Initialize the vertex position attribute from the vertex shader 

    var vPosition = gl.getAttribLocation( program1, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Render one red triangle on gray background
	// matches 64x64 size specified above
                  
    gl.viewport(0, 0, 64, 64);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT );
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    
    // Bind to window system frame buffer, unbind the texture
    
	// use the fb and renderbuffers created above
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    

    gl.disableVertexAttribArray(vPosition);
    
	// switch to program (vertex/frag shaders that use texture mapping
    gl.useProgram(program2);
        
    gl.activeTexture(gl.TEXTURE0);
    
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    
    // send data to GPU for normal render
    
    // vertices to form 2 blue triangles (together forming a square)
    var buffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER,   new flatten(vertices), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program2, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    
    var buffer3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer3);
    gl.bufferData( gl.ARRAY_BUFFER,   flatten(texCoord), gl.STATIC_DRAW);
    

    var vTexCoord = gl.getAttribLocation( program2, "vTexCoord"); 
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
    
	// this is the format of the texture we got from the frame buffer
    gl.uniform1i( gl.getUniformLocation(program2, "texture"), 0);
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 
    
    gl.viewport(0, 0, 512, 512);
    
    render();
}


function render() {
            
			// sort of a cheat here to color background blue.
            //No colors sent for the blue square, 
           //so drawing them is only applying the texture color at each fragment.
			
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // render quad with texture
        
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
