#include "uniforms.glsl"
#include "pi.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

uniform float size; //slider:0.0,1.0,0.5

vec2 ycam[9] = vec2[](
  vec2( 140.0, 66.0 ),
  vec2( 24.0, 0.0 ),
  vec2( 0.0, 37.0 ),
  vec2( 115.0, 105.0 ),
  vec2( 115.0, 240.0 ),
  vec2( 165.0, 240.0 ),
  vec2( 165.0, 105.0 ),
  vec2( 280.0, 37.0 ),
  vec2( 256.0, 0.0 )
);

float area2( in vec2 a, in vec2 b, in vec2 c ) {
		return ( ( ( a.x * b.y ) + ( a.y * c.x ) + ( b.x * c.y ) ) -
					 ( ( c.x * b.y ) + ( c.y * a.x ) + ( b.x * a.y ) ) );
}

float area( in vec2 a, in vec2 b, in vec2 c ) {
		return area2( a, b, c ) * 0.5;
}

bool left( in vec2 a, in vec2 b, in vec2 c ) {
  return area2( a, b, c ) > 0;
}

bool leftOn( in vec2 a, in vec2 b, in vec2 c ) {
  return area2( a, b, c ) >= 0;
}

bool colinear( in vec2 a, in vec2 b, in vec2 c ) {
  return area2( a, b, c ) == 0;
}

bool betweenAprox( in vec2 a, in vec2 b, in vec2 c ) {
  if( a[0] != b[0] ) {
      return ( ( a[ 0 ] <= c[ 0 ] ) && ( c[ 0 ] <= b[ 0 ] ) ) ||
             ( ( a[ 0 ] >= c[ 0 ] ) && ( c[ 0 ] >= b[ 0 ] ) );
  }
  else {
    return ( ( a[ 1 ] <= c[ 1 ] ) && ( c[ 1 ] <= b[ 1 ] ) ) ||
           ( ( a[ 1 ] >= c[ 1 ] ) && ( c[ 1 ] >= b[ 1 ] ) );
  }
  return false;
}

bool between( in vec2 a, in vec2 b, in vec2 c ) {
  if( !colinear( a, b, c ) ) {
    return false;
  }
  if( a[0] != b[0] ) {
      return ( ( a[ 0 ] <= c[ 0 ] ) && ( c[ 0 ] <= b[ 0 ] ) ) ||
             ( ( a[ 0 ] >= c[ 0 ] ) && ( c[ 0 ] >= b[ 0 ] ) );
  }
  else {
    return ( ( a[ 1 ] <= c[ 1 ] ) && ( c[ 1 ] <= b[ 1 ] ) ) ||
           ( ( a[ 1 ] >= c[ 1 ] ) && ( c[ 1 ] >= b[ 1 ] ) );
  }
  return false;
}

bool intersectProper( in vec2 a, in vec2 b, in vec2 c, in vec2 d ) {
	if( colinear( a, b, c ) ||
      colinear( a, b, d ) ||
      colinear( c, d, a ) ||
      colinear( c, d, b ) ) {
    return false;
  }
  if( left( a, b, c ) != left( a, b, d ) &&
      left( c, d, a ) != left( c, d, b ) ) {
      return true;
  }
  return false;
}

bool intersect( in vec2 a, in vec2 b, in vec2 c, in vec2 d ) {
  if( intersectProper( a, b, c, d ) ) {
    return true;
  }
  else if( between( a, b, c ) ||
           between( a, b, d ) ||
           between( c, d, a ) ||
           between( c, d, b ) ) {
    return true;
  }
  return false;
}

void processLogo() {
	for( int i = 0; i < 9; i++ ) {
	  ycam[ i ].x = ycam[ i ].x / 280.0 - 0.5;
	  ycam[ i ].y = - ycam[ i ].y / 240.0 + 0.5;
	  ycam[ i ].x *= size;
	  ycam[ i ].y *= size;
	}
}

float insideLogo( in vec2 pt ) {
	int len = 9;
	for( int i = 0; i < len; i++ ) {
		vec2 a = ycam[ i ];
		vec2 b = ycam[ ( i + 1 ) % len ];
		float area = area2( a, b, pt );
		if( area > 0.0 && area > 0.1 ) {
			return 1.0;
		}
	}
	return 0.0;
}

vec2 tr = vec2( 1.0, 1.0 );
vec2 bl = vec2( -1.0, -1.0 );

float line( in vec2 a, in vec2 b,in vec2 c, in float lineWidth ) {
		float area = area2( a, b, c );
		float lw = lineWidth / max( iResolution.x, iResolution.y );
		lw *= 0.5;
		if( area > -lw && area < lw && betweenAprox( a, b, c ) ) {
			return 1.0;
		}
		return 0.0;
}

float cross2(  in vec2 a, in vec2 b ) {
  return a.x * b.y -  a.y * b.x;
}



float intersectTime( in vec2 a, in vec2 b, in vec2 c, in vec2 d ) {
  vec2 p = a;
  vec2 r = b - p;
  vec2 q = c;
  vec2 s = d - q;
  return ( cross2( q, s ) - cross2( p, s ) ) / cross2( r, s );
}

void main(void)
{
		processLogo();

		vec2 q = vTexcoord.xy;
    vec2 p = -1.0 + 2.0 * q;
		p.x *= iAspect;
		float time = 15.0 + iGlobalTime;

		vec2 m = -1.0 + 2.0 * ( iMouse.xy / iResolution.xy );
		m.x *= iAspect;

		vec3 col = vec3( 0.0 );

    vec2 a = vec2( 0.5, 0.0 );
    vec2 b = vec2( 0.0, 0.50 );
    vec2 c = vec2( -0.5, 0.0 );
    vec2 d = vec2( 0.0, -0.5 );

    col += line( a, b, p, 2.0 );
    col += line( b, c, p, 2.0 );
    col += line( c, d, p, 2.0 );
    col += line( d, a, p, 2.0 );

    col += line( vec2( -1.0, 0.0 ), vec2( 1.0, 0.0 ), p, 4.0 );
    col += line( vec2( 0.0, -1.0 ), vec2( 0.0, 1.0 ), p, 4.0 );


    float t = intersectTime( vec2( 0.0 ), p, a, b ) ;
    if( t > 0 && t < 1.0 ) {
      col += t;
    }

    t = intersectTime( vec2( 0.0 ), p, b, c ) ;
    if( t > 0 && t < 1.0 ) {
      col += t;
    }

    t = intersectTime( vec2( 0.0 ), p, c, d ) ;
    if( t > 0 && t < 1.0 ) {
      col += t;
    }

    t = intersectTime( vec2( 0.0 ), p, d, a ) ;
    if( t > 0 && t < 1.0 ) {
      col += t;
    }



		// if( colinear( bl, tr, p ) ) {
		// 	col = vec3( 1.0 );
		// }

		// col = pow( col, vec3( 0.4545 ) );
    oColor = vec4( col, 1.0 );
}
