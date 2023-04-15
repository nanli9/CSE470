var u_step;
var v_step;
var x_slices;
var y_slices;
function drawTorus(){ 
    u_step=2*pi/10;
    v_step=2*pi/10;
    x_slices = (2*pi)/u_step+1;
    y_slices = (2*pi)/v_step+1;
    for(var u=0;u<=2*pi;u=u+u_step){
        for(var v=0;v<=2*pi;v=v+v_step){
            var a = 0.2;
            var b = 0.1;
            var points=vec3((a+b*Math.cos(v))*Math.cos(u),(a+b*Math.cos(v))*Math.sin(u),b*Math.sin(v));
            var du = vec3(-(a+b*Math.cos(v))*Math.sin(u),(a+b*Math.cos(v))*Math.cos(u),0);
            var dv = vec3(-b*Math.sin(v)*Math.cos(u),-b*Math.sin(v)*Math.sin(u),b*Math.cos(v));
            var normal=normalize(cross(du,dv));
            pointsArray.push(points);
            normalsArray.push(normal);
            tangentArray.push(du);
            texCoordsArray.push(vec2(u/2*pi,v/2*pi));  
            numPoints++;          
        }
        
    }  
    buildTriangles(x_slices,y_slices);
}
function buildTriangles(x_slices,y_slices){
    indexPoints = [];
    indexNormals = [];
    console.log(pointsArray.length);
    for(var i=0;i<x_slices-1;i++){
        for(var j=0;j<y_slices-1;j++){
            indexPoints.push(i*x_slices+j);
            indexPoints.push(i*x_slices+j+1);
            indexPoints.push((i+1)*x_slices+j);
            indexPoints.push((i+1)*x_slices+j);
            indexPoints.push((i+1)*x_slices+j+1);
            indexPoints.push(i*x_slices+j+1);
            numVertices += 6;
        }
    }
}
function createBumpMapRectangle() {
	
	var data = new Array();
    for (var i = 0; i<= texSize; i++)  
		data[i] = new Array();
	
	// create a texture-sized 2d array of height values
	// first make them all 0
    for (var i = 0; i<= texSize; i++) 
		for (var j=0; j<=texSize; j++) 
			data[i][j] = 0.0;
		
	// elevate some in the middle
    
	for (var i = texSize/4; i<4*texSize/4; i++) 
			for (var j = texSize/4; j<4*texSize/4; j++)
				data[i][j] = 1.0;
	//add another bump  
	for (var i = 3*texSize/8; i<5*texSize/8; i++) 
			for (var j = 3*texSize/8; j<5*texSize/8; j++)
				data[i][j] = 2.0;

				for (var i = 14*texSize/16; i<16*texSize/16; i++) 
			for (var j = 14*texSize/16; j<16*texSize/16; j++)
				data[i][j] = 2.0;

	// Bump Map Normals
	// Use a forward difference for the derivative
	// [1 0 du] x [0, 1, dv] = [-du -dv 1]
    
	var normalst = new Array()
		for (var i=0; i<texSize; i++)  
			normalst[i] = new Array();
		
    for (var i=0; i<texSize; i++) 
		for ( var j = 0; j < texSize; j++) 
			normalst[i][j] = new Array();
		
    for (var i=0; i<texSize; i++) {
		for ( var j = 0; j < texSize; j++) {
			normalst[i][j][0] = -(data[i+1][j]-data[i][j]);
			normalst[i][j][1] = -(data[i][j+1]-data[i][j]);
			normalst[i][j][2] = 1;
		}
    }

	// Transform normals so they conform to texture format, 
	// which is a color [0, 255]. Do it in 5 steps
	// step 1) normalize the normal so each component lives in [-1,1]
	// step 2) scale to [-0.5, 0.5]
	// step 3) translate to [0, 1]

    for (var i=0; i<texSize; i++) {
		for (var j=0; j<texSize; j++) {
			// find length of vector
			var d = 0;
			for(k=0;k<3;k++) 
				d+=normalst[i][j][k]*normalst[i][j][k];
			d = Math.sqrt(d);
			// normalize, scale to [-0.5, 0.5], and translate
			for(k=0;k<3;k++) 
				normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
		}
    }
	// step 4) scale each component from [0,1] to [0, 255]
	// step 5) load into linear array of correct format

    for ( var i = 0; i < texSize; i++ ) 
        for ( var j = 0; j < texSize; j++ ) 
           for(var k =0; k<3; k++) 
                bumpNormals[3*texSize*i+3*j+k] = 255*normalst[i][j][k];

}
function createBumpMapSinCos() {
	
	var x, y, val;
	// create a sharper edge with a threshold
	var threshold = 0.1;
	
	var data = new Array();
    for (var i = 0; i<= texSize; i++)  
		data[i] = new Array();
	
	// create a texture-sized 2d array of height values
	// first make them all 0
    for (var i = 0; i<= texSize; i++) {
		x = (i/texSize)*4*Math.PI;
		for (var j=0; j<=texSize; j++) {
			y = (j/texSize)*2*Math.PI;
			val = Math.sin(x) * Math.cos(y);
			if(val > threshold)
				data[i][j] = 3*val;
			else 
				data[i][j] = 0.5;
		}
	}
		
	 

	// Bump Map Normals
	// Use a forward difference for the derivative
	// [1 0 du] x [0, 1, dv] = [-du -dv 1]
    
	var normalst = new Array()
		for (var i=0; i<texSize; i++)  
			normalst[i] = new Array();
		
    for (var i=0; i<texSize; i++) 
		for ( var j = 0; j < texSize; j++) 
			normalst[i][j] = new Array();
		
    for (var i=0; i<texSize; i++) {
		for ( var j = 0; j < texSize; j++) {
			normalst[i][j][0] = -(data[i+1][j]-data[i][j]);
			normalst[i][j][1] = -(data[i][j+1]-data[i][j]);
			normalst[i][j][2] = 1;
		}
    }

	// Transform normals so they conform to texture format, 
	// which is a color [0, 255]. Do it in 5 steps
	// step 1) normalize the normal so each component lives in [-1,1]
	// step 2) scale to [-0.5, 0.5]
	// step 3) translate to [0, 1]

    for (var i=0; i<texSize; i++) {
		for (var j=0; j<texSize; j++) {
			// find length of vector
			var d = 0;
			for(k=0;k<3;k++) 
				d+=normalst[i][j][k]*normalst[i][j][k];
			d = Math.sqrt(d);
			// normalize, scale to [-0.5, 0.5], and translate
			for(k=0;k<3;k++) 
				normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
		}
    }
	// step 4) scale each component from [0,1] to [0, 255]
	// step 5) load into linear array of correct format

    for ( var i = 0; i < texSize; i++ ) 
        for ( var j = 0; j < texSize; j++ ) 
           for(var k =0; k<3; k++) 
                bumpNormals[3*texSize*i+3*j+k] = 255*normalst[i][j][k];

}