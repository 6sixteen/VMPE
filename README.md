# VMPE
## Description
VMExplorer, a visual analysis system based on sampling for exploring parameter space under consideration of different test images in vision measurement.  

<img
  src="https://github.com/6sixteen/VMPE/tree/main/assets/system_overview.jpg"
  alt="system_overview"
  width="500"
/>  
***System Interface.*** (A) Basic Information View displays necessary information, including image sets, sample information and the algorithm. (B) Image Class View shows the relationship among images and class information based on the weighted Jaccard Index and provides fundamental interactions such as changing the image class. (C) Parameter View displays the relationship between different parameters and supports comparing two parameter sets in the line chart. (D) Order View presents the intersection order of the group of parameter sets. (E)Intersection View shows the intersection process of parameter sets with pixel-based image and heatmap.
## Abstraction
Vision measurement becomes a prominent driving force to control product quality in industrial automation with high precision, high efficiency, 
and non-destruction. 
However, designing lighting schemes and optimizing parameters is critical but time-consuming in vision measurement, requiring extensive 
experience for vision engineers. 
It is difficult for engineers to try various parameter combinations in multiple test images to improve measurement quality. 
To address these challenges, we formulate the essential tasks(classification and optimization) and detailed user requirements in 
close collaboration with front-line engineers. 
Further, we design VMExplorer, a visual analysis system based on sampling for exploring parameter space under consideration of different test images.
 We introduce the set theory and propose a weighted Jaccard Index of parameter sets to measure the relationship between two images. 
 An interactive overview with bubbles is provided to depict the classification and the relationship among images. 
 We also design a novel visualization consisting of pixel-based image and heatmap to indicate the pattern in the intersection process of parameter 
 sets. 
 Several intersection orders are suggested to assist users in generating better classification. 
 Furthermore, the parameter relationship is visualized with a matrix-based line chart. 
 Through our system, users can classify the images, understand the parameters importance and the relationship between parameters. 
 We conduct one case study with engineers having different working years to showcase how our system facilitates parameter exploration 
 in vision measurement. Finally, we discuss the strengths and limitations of the proposed approach according to the feedback from the engineers
## Usage
```
git clone https://github.com/6sixteen/VMPE
```
### Data
[Data Description](https://github.com/6sixteen/VMPE/tree/main/data/Readme.md)
### Backend
[You can use ***anaconda*** to manage this project](https://docs.anaconda.com/anaconda/user-guide/getting-started/)
```
cd ~/VMPE/backend
pip install -r requirements.txt
run app.py
```
### Frontend
 ```
npm install
npm run dev
visit localhost:3000 in your browser
```
### Interaction
In Information View(A), users can slide the scroll bar to observe the image set on the left side and observe the algorithm on the right side.
After pressing '***X***', the sidebar pops up.  

<img
  src="https://github.com/6sixteen/VMPE/tree/main/assets/sidebar.JPG"
  alt="sidebar"
  width="500"
/>  
***Sidebar*** Users can enter parameter, such as filter range, class number and so on.  

In Class View(B), users can ***click the rectangle*** in the glyph to view the image. Users can ***press alt and click left bottom*** to perform the conversion of id and reverse. 
Users can also drag the glyph to change its class or to produce new class. 
By ***double clicking the left mouse***, users can translate to drag mode and ***drag*** interesting glyphs to observe the intersection process in Intersection View(E).
<img
  src="https://github.com/6sixteen/VMPE/tree/main/assets/intersection_view.jpg"
  alt="intersection_view"
  width="500"
  height="500"
/> 

***Intersection View*** Parameter-set tributary and intersection river in Intersection View. 
(A) Parameter-set tributary consists of three parts: pixel-based image, heatmap, and circles to display the parameter set. 
Pixel-based image encodes the entire parameter set and heatmap encodes the statistical parameter matrix calculated from the parameter set. 
Circles represent the group of parameter sets to intersect. 
(B)Intersection river is made up of multiple parameter-set tributaries and each column represents an intersection between two parameter sets.
 
In Intersection View, users can ***click two parameter-set tributaries*** and Parameter View(C) displays parameter set.  

<img
  src="https://github.com/6sixteen/VMPE/tree/main/assets/parameter_view.jpg"
  alt="parameter_view"
  width="500"
/> 

In Parameter View, users can click the circles to change parameter orders.
