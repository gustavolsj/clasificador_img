let model;
let class_indices;
let fileUpload = document.getElementById('uploadImage')
let img = document.getElementById('image')
let boxResult = document.querySelector('.box-result')
let confidence = document.querySelector('.confidence')
let pconf = document.querySelector('.box-result p')

        // ---------------------------------------------------------LIBRERIA ProgressBar JS
        let progressBar = 
            new ProgressBar.Circle('#progress', {
            color: 'limegreen',
            strokeWidth: 10,
            duration: 2000, // milliseconds
            easing: 'easeInOut'
        });

        // -----------------------------------------------------------CARGA CLASES JSON
        async function fetchData(){
            let response = await fetch('./class_indices.json');
            let data = await response.json();
            data = JSON.stringify(data);
            data = JSON.parse(data);
            return data;
        }

         // here the data will be return.
        

        // -------------------------------------------------------------CARGA MODELO
        async function initialize() {
            let status = document.querySelector('.init_status')
            status.innerHTML = 'Cargando el modelo .... <span class="fa fa-spinner fa-spin"></span>'
            model = await tf.loadLayersModel('./tensorflowjs-model/model.json');
            status.innerHTML = 'Modelo cargado Ok</span>'
        }

        // -----------------------------------------------IDENTIFICAR    
        async function predict() {
            // Function for invoking prediction
            let img = document.getElementById('image') 
            let offset = tf.scalar(255)
            // -------------------------------------------------PROCESA IMG A TENSOR

            // tf.browser.fromPixels() Loads the uploaded input image, and converts it to a tensor format,
            // .resizeNearestNeighbor([224,224]) method resizes the image dimension to width = 224, and height = 224,
            // .toFloat() method casts the tensor to type float32,
            // .expandDims() method adds an outer batch dimension to the existing tensor i.e [1,224,224],
            let tensorImg =   tf.browser.fromPixels(img).resizeNearestNeighbor([224,224]).toFloat().expandDims();
            
            // .div() method simply rescales the image (i.e divides it by the scalar 255.0 as done during training).
            let tensorImg_scaled = tensorImg.div(offset)

            // --------------------------------------------PREDICCION
            prediction = await model.predict(tensorImg_scaled).data();
           

            // --------------------------------------------------- MOSTRAR RESULTADO
            fetchData().then((data)=> 
                {   
                    //   ------------------------------------------CLASE MAS PROBABLE
                    predicted_class = tf.argMax(prediction)
                    
                    class_idx = Array.from(predicted_class.dataSync())[0]
                    document.querySelector('.pred_class').innerHTML = data[class_idx]
                    document.querySelector('.inner').innerHTML = `${parseFloat(prediction[class_idx]*100).toFixed(0)}%`
                    console.log(data)
                    console.log(data[class_idx])
                    console.log(prediction)

                    progressBar.animate(prediction[class_idx]-0.005); // percent

                    pconf.style.display = 'block'

                    confidence.innerHTML = Math.round(prediction[class_idx]*100)
  
                }
            );
            
        }

        // ----------------------------------------------------------------CARGA DE IMAGEN

        fileUpload.addEventListener('change', function(e){
            
            let uploadedImage = e.target.value
            if (uploadedImage){
                document.getElementById("blankFile-1").innerHTML = uploadedImage.replace("C:\\fakepath\\","")
                document.getElementById("choose-text-1").innerText = "Cambiar foto"
                // document.querySelector(".success-1").style.display = "inline-block"

                let extension = uploadedImage.split(".")[1]
                if (!(["doc","docx","pdf"].includes(extension))){
                    document.querySelector(".success-1 i").style.border = "1px solid limegreen"
                    document.querySelector(".success-1 i").style.color = "limegreen"
                }else{
                    document.querySelector(".success-1 i").style.border = "1px solid rgb(25,110,180)"
                    document.querySelector(".success-1 i").style.color = "rgb(25,110,180)"
                }
            }
            let file = this.files[0]
            if (file){
                // boxResult.style.display = 'block'
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.addEventListener("load", function(){
                    
                    // img.style.display = "block"
                    img.setAttribute('src', this.result);
                });
            }

            else{
            img.setAttribute("src", "");
            }

            initialize().then( () => { 
                predict()
            })
        })