# -*- coding: utf-8 -*-
"""
Created on Thu May 28 14:22:35 2020

@author: mique
"""


from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
def watermark_text(input_image_path,
                   output_image_path,
                   text, pos):
    photo = Image.open(input_image_path)
    pos = (0,photo.size[1]-20)
    # make the image editable
    drawing = ImageDraw.Draw(photo)
    black = (3, 8, 12)
    #font = ImageFont.truetype("Pillow/Tests/fonts/FreeMono.ttf", 40)
    drawing.text(pos, text, fill=black)
    photo.show()
    photo.save(output_image_path)
if __name__ == '__main__':
    for i in range(10,24):
        img = "heatmaps/"+str(i)+".png"
        watermark_text(img, "heatmaps/"+str(i)+"_w.png",
                       text=str(i)+":00",
                       pos=(1, 0))