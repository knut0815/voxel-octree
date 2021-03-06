#version 300 es

precision lowp float;
precision lowp sampler2D;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;

uniform sampler2D tDiffuseL;
uniform sampler2D tNormalL;
uniform sampler2D tPositionL;
uniform sampler2D tRTLightL;


uniform sampler2D tRTLight;
uniform sampler2D tRTFiltered;

uniform mat4 oldMVP;
uniform int rtBlocks;
uniform vec2 sampleSize;
uniform vec2 sampleRTSize;
uniform float reset;

in vec2 v_texCoord;

out vec4 outColor;


void main() {

    vec2 sampleX = vec2(sampleSize.x,0);
    vec2 sampleY = vec2(0, sampleSize.y);

    vec4 d = texture(tDiffuse, v_texCoord);
    vec3 n = texture(tNormal, v_texCoord).xyz;
    vec4 p = texture(tPosition, v_texCoord);


    vec4 rtC = texture(tRTLight, v_texCoord) + texture(tRTLight, v_texCoord + sampleX) + texture(tRTLight, v_texCoord - sampleX) + texture(tRTLight, v_texCoord + sampleY) + texture(tRTLight, v_texCoord - sampleY);
    rtC /= 5.0;

    vec4 posOld = oldMVP * vec4(p.xyz, 1.0);
    vec2 uvOld = (posOld.xy / (posOld.w  )) * 0.5 + 0.5;



    vec3 nL = (texture(tNormalL, uvOld).xyz  + texture(tNormalL, uvOld + sampleX).xyz + texture(tNormalL, uvOld - sampleX).xyz  + texture(tNormalL, uvOld + sampleY).xyz + texture(tNormalL, uvOld - sampleY).xyz) / 5.0;
    vec4 dL = texture(tDiffuseL, uvOld) * 0.2 + texture(tDiffuseL, uvOld + sampleX) * 0.2 + texture(tDiffuseL, uvOld - sampleX) * 0.2 + texture(tDiffuseL, uvOld + sampleY) * 0.2 + + texture(tDiffuseL, uvOld - sampleY) * 0.2;
    vec4 pL = texture(tPositionL, uvOld) * 0.2 + texture(tPositionL, uvOld + sampleX) * 0.2 + texture(tPositionL, uvOld -sampleX) * 0.2 + texture(tPositionL, uvOld + sampleY) * 0.2 + texture(tPositionL, uvOld - sampleY) * 0.2;
//    vec3 nL = texture(tNormalL, uvOld).xyz;
//    vec4 dL = texture(tDiffuseL, uvOld);
//    vec4 pL = texture(tPositionL, uvOld);
    //vec4 pL = texture(tPositionL, uvOld);
    vec4 rtL = texture(tRTLightL, v_texCoord) * 0.2 + texture(tRTLightL, v_texCoord + sampleX) * 0.2 + texture(tRTLightL, v_texCoord - sampleX) * 0.2 + texture(tRTLightL, v_texCoord + sampleY) * 0.2 + texture(tRTLightL, v_texCoord - sampleY) * 0.2;

    vec4 sum = texture(tRTFiltered, uvOld) + texture(tRTFiltered, uvOld + sampleX) + texture(tRTFiltered, uvOld - sampleX) + texture(tRTFiltered, uvOld - sampleY) + texture(tRTFiltered, uvOld + sampleY);
    //vec4 sum = texture(tRTFiltered, uvOld);
    sum /= 5.0;

    if (sum.w >= 32.0 && (reset < 1.0 || sum.w >= 64.0)) {
//    if (sum.w >= 16.0) {
        sum = vec4(sum.rgb / 1.5, sum.w / 1.5);
    }

    // TODO
    if (abs(uvOld.x -0.5) > 0.5 || abs(uvOld.y-0.5) > 0.5 || distance(d.xyz, dL.xyz) > 0.01 || distance(n, nL) > 0.005 || distance(p.xyz, pL.xyz) > 0.005) {
    
        
        sum = vec4(sum.rgb / 2.0, sum.w / 2.0);


        //rtC = texture(tRTLightL, v_texCoord);
        //sum = vec4(rtL.rgb, 1.0);
    }
    
    
    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1 || length(nL.xyz) < 0.1 || length(nL.xyz) > 1.1) {
        // cursor
    

        sum = vec4(rtC.rgb, 1.0);
    }

    
    outColor = sum + vec4(clamp(rtC.rgb, sum.rgb / sum.w - vec3(0.5),sum.rgb / sum.w + vec3(0.5) ), 1.0) ;
    //outColor = vec4(rtC.xyz, 1);


    //outColor.x = texture(tPositionL, uvOld).w;
    //outColor.x = p.w;
    outColor = vec4(1,0,0,1);//texture(tPosition, v_texCoord);

}

