




// normal matrix
// inverse of the transpose of the modelview matrix
// input is a mat4 output is a mat3

function normalMatrixMat3(mat) {

    dest = mat3();
	
	// transfer to mat3 as transpose
	var a00 = mat[0][0], a01 = mat[1][0], a02 = mat[2][0];
	var a10 = mat[0][1], a11 = mat[1][1], a12 = mat[2][1];
	var a20 = mat[0][2], a21 = mat[1][2], a22 = mat[2][2];
	
	var b01 = a22*a11-a12*a21;
	var b11 = -a22*a10+a12*a20;
	var b21 = a21*a10-a11*a20;
		
	var d = a00*b01 + a01*b11 + a02*b21;
	if (!d) { return null; }
	var id = 1/d;
	
	
	dest[0][0] = b01*id;
	dest[0][1] = (-a22*a01 + a02*a21)*id;
	dest[0][2] = (a12*a01 - a02*a11)*id;
	dest[1][0] = b11*id;
	dest[1][1] = (a22*a00 - a02*a20)*id;
	dest[1][2] = (-a12*a00 + a02*a10)*id;
	dest[2][0] = b21*id;
	dest[2][1] = (-a21*a00 + a01*a20)*id;
	dest[2][2] = (a11*a00 - a01*a10)*id;
	
	return dest;
};

// convert a mat4 matrix to a mat3
function mat4Tomat3(mat) {
	a = mat3();
	for(var i=0; i<3; i++) {
		for(var j=0; j<3; j++) {
			a[i][j] = mat[i][j];
		}
	}
	return a;
}

// I think this is the same as normalmatrix above. 
// I found error and rename it. Take a look again and delete if so.
//(DCH)

function mat4ToInverseMat3(mat) {

    dest = mat3();
	
	var a00 = mat[0][0], a01 = mat[0][1], a02 = mat[0][2];
	var a10 = mat[1][0], a11 = mat[1][1], a12 = mat[1][2];
	var a20 = mat[2][0], a21 = mat[2][1], a22 = mat[2][2];
	
	var b01 = a22*a11-a12*a21;
	var b11 = -a22*a10+a12*a20;
	var b21 = a21*a10-a11*a20;
		
	var d = a00*b01 + a01*b11 + a02*b21;
	if (!d) { return null; }
	var id = 1/d;
	
	
	dest[0][0] = b01*id;
	dest[0][1] = (-a22*a01 + a02*a21)*id;
	dest[0][2] = (a12*a01 - a02*a11)*id;
	dest[1][0] = b11*id;
	dest[1][1] = (a22*a00 - a02*a20)*id;
	dest[1][2] = (-a12*a00 + a02*a10)*id;
	dest[2][0] = b21*id;
	dest[2][1] = (-a21*a00 + a01*a20)*id;
	dest[2][2] = (a11*a00 - a01*a10)*id;
	
	return dest;
};
