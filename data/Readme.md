
# Data for VMExplorer
## Data Description
In this case, we measure the area of the white pin section of the circuit board. 
We took **22** images at different angles of the targets or lighting conditions and identify each image with a unique id to distinguish. 
Then we selected **4** parameters from **3** key operators for sampling in the visual algorithm. 
Parameter one is ***thresholdMin*** in operator ***threshold***, and its minimum, maximum and step size are 20, 40, 1. 
Parameter two is ***thresholdMax*** in operator ***threshold***, and its minimum, maximum and step size are 40, 60, 1. 
Parameter three is ***openingCircle*** in operator  ***opeinging\_circle***, and its minimum, maximum and step size are 2, 10, 1. 
Parameter four is ***selectShapeMatrix*** in operator  ***select\_shape***, and its minimum, maximum, and step size are 0.8, 0.84, 0.01.
These parameters are ***representative*** that often appear in measurement algorithms. 
The size of the parameter set for each image is 19845. The accuracy range of the measurement target is 34000-36000 in pixel. 
## Download
Yon can download data from "https://pan.baidu.com/s/12wj9bLFPMAkD7F2IXmC6pQ" code：4y47
## Change Config
You should change ***config.yml*** in ~/VMPE/backend/config.yml  
For instance, caseBaseFile: "D:/codeTest/parameterExp/data/case1" ===> caseBaseFile: "***your abstract address***"/data/case1  
same for combinationFile,projectionFile,graphFile,imageMap,parameterFile

## File Structure
That's how your project is supposed to be.(***main file structure***)  

|-- VMPE  
&emsp;&emsp;|-- .gitignore  
&emsp;&emsp;|-- README.md  
&emsp;&emsp;|-- backend  
&emsp;&emsp;|-- data  
&emsp;&emsp;|&emsp;&emsp;|-- Readme.md  
&emsp;&emsp;|&emsp;&emsp;|-- case1<br/>
&emsp;&emsp;|&emsp;&emsp;|-- combination<br/>
&emsp;&emsp;|&emsp;&emsp;|-- graph<br/>
&emsp;&emsp;|&emsp;&emsp;|-- img<br/>
&emsp;&emsp;|&emsp;&emsp;|-- parameter<br/>
&emsp;&emsp;|-- frontend<br/>
## File Description
case1/img: images  

case1/parameter: sample parameters  

case1/graph: graph structure for these images to represent relationship among images  

case1/combination: combination file


