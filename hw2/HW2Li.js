var canvas;
var gl;

var initPos=[];
var moveSpeed=0.007;
var numCube=9;
var numVertices = 8;
var numTriangles = 12;
var scale=0.1;
var kft=[];
var tmp=[];
var stepsize=0.001;
var startAngle=0;
var stopAngle=800;
var angle=[];

var on=true;
var rotateAxis = [];

var cubeVertices = [];
var cubeColor = [];
var cubeCenter = [];

var thetaLoc;

var mvMatrix;

var modelView;
var vertices = [
	vec3( 0.0, 0.0,  0.0),
	vec3( 0.0, 1.0,  0.0 ),
	vec3( 1.0, 1.0,  0.0 ),
	vec3( 1.0, 0.0,  0.0 ),
	vec3( 0.0, 0.0, -1.0 ),
	vec3( 0.0, 1.0, -1.0),
	vec3( 1.0, 1.0, -1.0 ),
	vec3( 1.0, 0.0, -1.0 )
];

// Create your own colors!!
var vertexColors = [
        [ 0.5, 0.3, 0.0, 1.0 ],   
        [ 1.0, 0.4, 0.3, 1.0 ],   
        [ 1.0, 1.0, 0.2, 1.0 ],   
        [ 0.3, 1.0, 0.5, 1.0 ],   
        [ 0.1, 0.1, 0.3, 1.0 ],   
        [ 0.7, 0.3, 1.0, 1.0 ],  
        [ 0.0, 0.7, 0.6, 1.0 ],  
        [ 0.2, 1.0, 1.0, 1.0 ]   
];

function createCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    console.log("indices = ",indices);

    for ( var i = 0; i < indices.length; ++i ) {
        cubeVertices.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        cubeColor.push(vertexColors[a]);
        
    }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    createCube();

    console.log(cubeVertices);
    console.log(cubeColor);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
	// try turning off to demo z-buffer HSR NOT
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW );

    // can demo error that happens if input '3' rather than '4'
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );

     // also demo 2 or 4 here
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelView = gl.getUniformLocation( program, "modelView" );
	mvMatrix = mat4();

    //event listeners for silder
    document.getElementById( "scale" ).oninput = function () {
        console.log(this.value);
        scale = this.value;
    };
    document.getElementById( "KFT" ).oninput = function () {
        console.log(parseFloat(this.value));
        stepsize=parseFloat(this.value);
    };
    //click to turn off the animations
    canvas.addEventListener("mousedown", function(){
        console.log("Click");
        var screenx = event.clientX - canvas.offsetLeft;
		  var screeny = event.clientY - canvas.offsetTop;
		  
		  var posX = 2*screenx/canvas.width-1;
		  var posY = 2*(canvas.height-screeny)/canvas.height-1;
		  
          t1 = vec2(posX,posY);

        console.log("first point event x=",event.clientX);
        console.log("first point event y=",event.clientY);
        console.log("first point canvas x=",t1[0]);
        console.log("first point canvas y=",t1[1]);
        if(Math.abs(t1[0])<0.05 && Math.abs(t1[1])<0.05){     
            if(on)
                on=false;
            else 
                on=true;      
        }
        for(var i=0;i<numCube-1;i++){
            tmp.push(kft[i]);
            if(on)
                kft[i]=tmp[i];
            else 
                kft[i]=0.0;
        }
        console.log(cubeCenter);
        console.log(initPos);
    });
    //generate random unit vectors served as rotateAxis
    for(var i=0;i<numCube-1;i++)
    {
        let rotateAxisX=Math.random()*2-1;
        let rotateAxisY=Math.random()*2-1;
        let rotateAxisZ=Math.random()*2-1;
        rotateAxis.push(normalize(vec4(rotateAxisX,rotateAxisY,rotateAxisZ,0)));  
        cubeCenter.push(vec3(0,0,0));
        initPos.push(vec3(0,0,0));
        kft.push(0.001);
        angle.push(startAngle)
    }
    console.log(rotateAxis);
    
    render();
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //draw cube 0
    mvMatrix = mult(scalem(scale, scale, scale), translate(-0.5, -0.5, 0.5));
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) ); 
    gl.drawArrays( gl.TRIANGLES, 0, numTriangles*3,2);
    
    //kft to do animations
    for(var z=0;z<numCube-1;z++){
        if(kft[z] == 0.0) {}
        else if(kft[z] > 1.0) {
            kft[z] = 0.001;
            for(var j=0;j<3;j++){
                initPos[z][j] = 0;
                cubeCenter[z][j] = 0;
            }  
        }
        
        else {
            kft[z] += stepsize;
            angle[z]=kft[z]*stopAngle+(1-kft[z])*startAngle;
            
                for(var j=0;j<3;j++){
                    initPos[z][j] = initPos[z][j] + kft[z]*moveSpeed*rotateAxis[z][j];
                    cubeCenter[z][j] += kft[z]*moveSpeed*rotateAxis[z][j]; 
                }    
        }
    }   
    //draw other cubes
    for(var i=0;i<numCube-1;i++){
        mvMatrix = mult(scalem(scale, scale, scale), translate(-0.5, -0.5, 0.5));
        mvMatrix = mult(mult(translate(initPos[i][0], initPos[i][1], initPos[i][2]),rotate(angle[i],rotateAxis[i][0],rotateAxis[i][1],rotateAxis[i][2])),mvMatrix);
        
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) ); 
        gl.drawArrays( gl.TRIANGLES, 0, numTriangles*3,2);
    
    }
    requestAnimFrame( render );
}
