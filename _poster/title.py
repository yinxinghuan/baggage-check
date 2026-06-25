from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
img=Image.open("_poster/keyart.png").convert("RGBA")
W,H=img.size
# bottom scrim for legibility
scrim=Image.new("RGBA",(W,H),(0,0,0,0))
d=ImageDraw.Draw(scrim)
for i in range(int(H*0.34)):
    y=H-1-i; a=int(210*(i/(H*0.34))**1.3)
    d.line([(0,y),(W,y)],fill=(10,4,8,a))
img=Image.alpha_composite(img,scrim)
d=ImageDraw.Draw(img)
def font(paths,size):
    for p in paths:
        if os.path.exists(p):
            try:return ImageFont.truetype(p,size)
            except:pass
    return ImageFont.load_default()
title_f=font(["/System/Library/Fonts/Supplemental/Futura.ttc","/System/Library/Fonts/Avenir Next.ttc","/Library/Fonts/Arial Bold.ttf","/System/Library/Fonts/Helvetica.ttc"],62)
sub_f=font(["/System/Library/Fonts/Supplemental/Futura.ttc","/System/Library/Fonts/Avenir Next.ttc","/System/Library/Fonts/Helvetica.ttc"],26)
def ctext(y,txt,f,fill,shadow=(0,0,0,200)):
    bb=d.textbbox((0,0),txt,font=f); tw=bb[2]-bb[0]; x=(W-tw)//2-bb[0]
    d.text((x+2,y+2),txt,font=f,fill=shadow)
    d.text((x,y),txt,font=f,fill=fill)
ctext(int(H*0.74),"BAGGAGE",title_f,(255,255,255,255))
ctext(int(H*0.74)+58,"CHECK",title_f,(255,143,176,255))
ctext(int(H*0.92),"A DATING LOAD TEST",sub_f,(255,230,200,235))
img.convert("RGB").save("_poster/poster.png","PNG")
print("wrote _poster/poster.png",img.size)
