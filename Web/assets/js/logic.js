       /*Formatear las fechas actuale*/
        Date.prototype.toDateInputValue = (function() {
            var local = new Date(this);
            local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
            return local.toJSON().slice(0,10);
        });
        $('#start-date').val(new Date().toDateInputValue()).attr("min", new Date().toDateInputValue()); 
//Cargando Puestos de trabajo
        loadInfo("21/PUESTO/grupo/false/", "jobPlace");
        //Cargando puestos de trabajo
        loadInfo("21/EQUIPO%20DE%20COMPUTO/grupo/false/", "computerEquipment");
        //Cargando licencias de equipos
        loadInfo("21/LICENCIA%20EQUIPO%20DE%20COMPUTO/grupo/false/", "computerLicences");
        //Cargando Diademas
        loadInfo("21/DIADEMA/grupo/false/","headbands");
        //Cargando Marcadores
        loadInfo("21/LICENCIA%20DE%20MARCADORAS/grupo/false/","lincencesMarkers");
        //Cargar Adicionales
        loadInfo("21/ADICIONALES/grupo/false/","additionalsElements");

        //Carga
        function loadInfo(table, place){
            var url_ = "https://servon.com.co/index/dataGet/be5c205a1cec81934cee5a7e6e28f34e/1/1000/";
                url_ += table;
                 $.getJSON(
                    url_,
                    function( response ) {
                            $.each(response.data, function( key, val ) {
                                var option_ = $("<option/>");
                                    option_.attr("value", val.nombre.value);
                                    option_.attr("data-option", JSON.stringify(val));
                                    option_.text(val.nombre.value);

                                $("#select-"+place).append(option_);
                             });
                    });
        }

       //Agregar elementos Adicionales
        $("body").on("click","#add-new-aditional", function(){
            var padre_ = $("#formOm-"+$(this).attr("data-padre"));
            var additional = padre_.find(".aditional_:first-child").clone();
                additional.find("#title").remove();
                additional.find("input").each(function(){ $(this).val(''); });
                
                padre_.find("#adicionalesOm").append(additional);
        });
         //Remover elemento Adicional
        $("body").on("click","#removeMe", function(){
            var padre_ = $("#formOm-"+$(this).attr("data-padre"));
            if ( padre_.find(".aditionals-to-clone").length > 1 ){
                $(this).parent().parent().parent().parent().parent().remove();  
            }
        })

//Desencadenar el eveto principal
 $("body").on("change", "select#time-periods, input#amout-periods, #amount-jobs, select", function(){
        var padre = $("#formOm-"+$(this).attr("data-padre"));
           globalCalculate(padre);
});


//Agregar puesto de trabajo
$("body").on("click", "#add-new-placeJob", function(){
    var elemIds = $("#all-place-jobs .calculator").length;
        elemIds = elemIds+1;  

    var clone_el = $("#formOm-1").clone();
        clone_el.attr("id", "formOm-"+elemIds);
            
            clone_el.find("#add-new-aditional").each(function(){
                $(this).attr("data-padre", elemIds);
            })
            clone_el.find("#removeMe").each(function(){
                $(this).attr("data-padre", elemIds);
            })
       
            clone_el.find("select").each(function(){
                   $(this).attr("data-padre", elemIds);
            });
            clone_el.find("input").each(function(){
                    $(this).attr("data-padre", elemIds);
                var typeIs = $(this).attr("type");

                if ( typeIs == "date" ){
                       //console.warn("formatear fecha");
                    $(this).val(new Date().toDateInputValue()).attr("min", new Date().toDateInputValue());
                }

                if ( typeIs == "text" ){
                    $(this).val("");
                }
            });
       $("#all-place-jobs").append(clone_el);
});





function globalCalculate(padre){
            var periodo     = ( padre.find('#time-periods').val() == undefined || padre.find('#time-periods').val() == "") ? "dia" : padre.find('#time-periods').val();
            var periodoText = ( periodo == "horas" ) ? "12_horas" : "tarifa_"+periodo;
            var periodos    = ( padre.find('#amout-periods').val() == undefined || padre.find('#amout-periods').val() == "") ? 0 : padre.find('#amout-periods').val();
            var cantidad    = ( padre.find('#amount-jobs').val() == undefined || padre.find('#amount-jobs').val() == "" ) ? 0 : padre.find('#amount-jobs').val(); 
                
            if ( isNaN(cantidad) == true || isNaN(periodos)  == true ){
                alert("Existe un error con un valor no numerico");
            }else{
                //console.error("Falta change de valor unitario!");
                var jobPlace          = padre.find('#select-jobPlace').children('option:selected').data('option');
                var computerEquipment = padre.find('#select-computerEquipment').children('option:selected').data('option');
                var computerLicences  = padre.find('#select-computerLicences').children('option:selected').data('option');
                var typeHeadbands     = padre.find('#select-headbands').children('option:selected').data('option');
                var lincencesMarkers  = padre.find('#select-lincencesMarkers').children('option:selected').data('option');
                
                    //Puesto de trabajo
                    if ( jobPlace != undefined ){
                       obtainUnitValues( padre, jobPlace, periodoText, periodos, cantidad, "jobPlace" );
                    }else{ clearForm("jobPlace"); }

                    //Equipo_de_computo
                    if ( computerEquipment != undefined ){
                       obtainUnitValues( padre, computerEquipment, periodoText, periodos, cantidad, "computerEquipment" );
                    }else{ clearForm("computerEquipment"); }

                    //Lincencias
                    if ( computerLicences != undefined ){
                       obtainUnitValues( padre, computerLicences, periodoText, periodos, cantidad, "computerLicences" );
                    }else{  clearForm("computerLicences"); }

                    //typeHeadbands
                    if ( typeHeadbands != undefined ){
                       obtainUnitValues( padre, typeHeadbands, periodoText, periodos, cantidad, "headbands" );
                    }else{  clearForm("headbands"); }

                    //marcadoras
                    if ( lincencesMarkers != undefined ){
                       obtainUnitValues( padre, lincencesMarkers, periodoText, periodos, cantidad, "lincencesMarkers" );
                    }else{  clearForm("lincencesMarkers"); }
                    
                   //Elementos Adicionales
                    padre.find(".aditionals-elements").each(function(){
                        var grupo = $(this).data('grupo');
                        var optionDataAdic = $(this).children('option:selected').data('option');
                            if ( optionDataAdic != undefined ){
                                obtainUnitValues( padre, optionDataAdic, periodoText, periodos, cantidad, "optionDataAdic" );  
                             }else{  clearForm("optionDataAdic"); }
                    });

                var totalFinal = 0;
                var resumenCotizacion = periodoText+' + '+cantidad+' unidades + '+periodos+' periodos + ';

                $("input[placeholder='$Total']").each(function(){
                    if ( $(this).val() != '' ){
                            totalFinal += parseInt($(this).data('cost'));
                    }
                });

                $("#total-final").text(fNumber.go(totalFinal, "$")+' COP');
            }
}

       function obtainUnitValues(padre, mainObj, searchBy, cantidad, periodos, identify){
            padre.find('#'+identify+'_unitario').val( fNumber.go(mainObj[searchBy].value, "COP") );
            padre.find('#'+identify+'_total').val( fNumber.go(mainObj[searchBy].value*cantidad*periodos, "COP") );
            padre.find('#'+identify+'_total').data('cost', mainObj[searchBy].value * cantidad * periodos);     
        }


        var fNumber = {
                sepMil: ".", /* separador para los miles*/
                sepDec: ',', /* separador para los decimales*/
                formatear:function (num){
                    num +='';
                    var splitStr = num.split('.');
                    var splitLeft = splitStr[0];
                    var splitRight = splitStr.length > 1 ? this.sepDec + splitStr[1] : '';
                    var regx = /(\d+)(\d{3})/;
                    while (regx.test(splitLeft)) {
                        splitLeft = splitLeft.replace(regx, '$1' + this.sepMil + '$2');
                    }
                    return this.simbol+' '+ splitLeft + splitRight;
                },
                go:function(num, simbol){
                    this.simbol = simbol ||'';
                    return this.formatear(num);
                }
            }

        function clearForm(identify){
            $('#'+identify+'_unitario').val('');
            $('#'+identify+'_unitario').val('');
            $('#'+identify+'_unitario').data('cost','0');    
        }

$("#total-final").click(function(){
    cResumenFinal();
})


function carShoppingtemplate(data){
    console.info(data);

    var carHtml = '<div  class="col-xl-12 cotization basic-cotization">'
        carHtml += '<div class="row text-white" style="font-size: 0.8em;">';
        carHtml +=         '<div class="col-xl-12 bg-info p-3 mb-2">';
        carHtml +=             '<h5 class="text-white p-0 m-0">';
        carHtml +=                 'Resumen de cotización';
        carHtml +=                 'Puesto <span class="nameMarketStall">'+data.id_place+'</span>';
        carHtml +=             '</h5>';
        carHtml +=          '</div>';

        carHtml +=   '<div class="col-md-12 col-lg-4 col-xl-4 mb-4" class="periodoDeTiempo">';
        carHtml +=       '<p class="m-0 p-0">Periodo de tiempo:</p>';
        carHtml +=           '<h5 class="m-0 p-0">'+data.timePeriod+'</h5>';
        carHtml +=   '</div>';

        carHtml +=  '<div class="col-md-6 col-lg-4 col-xl-4 mb-4" class="fechaDeInicio">';
        carHtml +=     '<p class="m-0 p-0">Fecha de inicio:</p>';
              carHtml +=    '<h5 class="m-0 p-0" >'+data.start_date+'</h5>';
        carHtml +=  '</div>';

        carHtml +=  '<div class="col-md-6 col-lg-4 col-xl-4 mb-4" class="fechaDeFinal">';
        carHtml +=      '<p class="m-0 p-0">Fecha de cierre:</p>';
        carHtml +=      '<h5 class="m-0 p-0"> '+data.end_Date+'</h5>';
        carHtml +=  '</div>';

        carHtml +=  '<div class="col-lg-4 col-xl-4 mb-4" class="puestoDeTrabajo">';
        carHtml +=     '<p class="m-0 p-0">Puestos de trabajo:</p>';
        carHtml +=          '<h5 class="m-0 p-0">('+data.puestoDeTrabajo.cantidad+') '+data.puestoDeTrabajo.name+'</h5>';
        carHtml +=  '</div>';

        carHtml +=   '<div class="col-lg-4 col-xl-4 mb-4" class="equipoDeComputo">';
        carHtml +=        '<p class="m-0 p-0">Equipo de computo:</p>';
        carHtml +=          '<h5 class="m-0 p-0 mb-3 titleEquipo">'+data.equipoDeComputo.name+'</h5>';

        carHtml +=          '<p class="m-0 p-0">Licencia:</p>';
        carHtml +=          '<h5 class="m-0 p-0 titleLicence">'+data.equipoDeComputo.licencia+'</h5>';
        carHtml +=   '</div>';

        carHtml +=   '<div class="col-lg-4 col-xl-4 mb-4" class="tipoDeDiadema">';
        carHtml +=         '<p class="m-0 p-0">Tipo de diadema:</p>';
        carHtml +=          '<h5 class="m-0 p-0 mb-3 titleTipoDiadema">'+data.tipoDediadema.name+'</h5>';
        carHtml +=          '<p class="m-0 p-0">Licencia de marcadores:</p>';
        carHtml +=          '<h5 class="m-0 p-0 titleTipoLicencia">'+data.tipoDediadema.licencia+'</h5>';
        carHtml +=    '</div>';

        /*carHtml +=       '<div class="col-lg-4 col-xl-4 mb-4" style="border:1px solid magenta;" class="elementosAdicionales">';
        carHtml +=            '<p class="m-0 p-0">Elementos adicionales:</p>';
        carHtml +=                '<h5 class="m-0 p-0">($2) $Dos Hard Phone</h5>';
        carHtml +=          '</div>';*/
        carHtml +=      '</div>';
        carHtml +=   '</div>';

        return carHtml;
}

function cResumenFinal(){
     $("#web-car-summary").html("");
    //CONTAMOS lOS PUESTOS DE TRABAJO
        $("#all-place-jobs .calculator").each(function(index){
                    var fechaInicio      = $(this).find("#start-date").val();
                    var TimePeriod       = $(this).find("#amout-periods").val();
                    var cantidadPeriodos = $(this).find("#time-periods").val();
                    var FechaFinal       = ""//$(this).find("#time-periods").val();;

                    var PuestoDeTrabajo         = $(this).find("#select-jobPlace").val();
                    var PuestoDeTrabajoCantidad = $(this).find("#amount-jobs").val();
                    var PuestoDeTrabajoUnitario = $(this).find("#jobPlace_unitario").val();
                    var PuestoDeTrabajoTotal    = $(this).find("#jobPlace_total").val();

                    if ( TimePeriod != undefined && cantidadPeriodos != '' && PuestoDeTrabajo != '' && PuestoDeTrabajoCantidad != ''){

                        var identify_ = "cotization-"+$(this).attr("id");
                        /*::::::::*/
                            var EquiposDeComputo       = $(this).find("#select-computerEquipment").val(),
                                EquiposDeComputoUnidad = $(this).find("#optionDataAdic_unitario").val();
                                //EquiposDeComputoTotal  = $(this).find("#optionDataAdic_total").val();

                            var TiposDeLicencias       = $(this).find("#select-computerLicences").val();
                                //TiposDeLicenciasUnidad = $(this).find("#computerLicences_unitario").val();
                                //TiposDeLicenciasTotal  = $(this).find("#computerLicences_total").val();

                            var TiposDeDiadema       = $(this).find("#select-headbands").val();
                                //TiposDeDiademaUnidad = $(this).find("#headbands_unitario").val();
                                //TiposDeDiademaTotal  = $(this).find("#headbands_total").val();

                            var LicenciaDeMarcadoras       = $(this).find("#select-lincencesMarkers").val();
                                //LicenciaDeMarcadorasUnidad = $(this).find("#lincencesMarkers_unitario").val();
                                //LicenciaDeMarcadorasTotal  = $(this).find("#lincencesMarkers_total").val();


                                if ( EquiposDeComputo == undefined || EquiposDeComputo == "" ){
                                        EquiposDeComputo = "No aplica";
                                }
                                 if ( TiposDeLicencias == undefined || TiposDeLicencias == "" ){
                                       TiposDeLicencias = "No aplica";
                                }
                                if ( TiposDeDiadema == undefined || TiposDeDiadema == "" ){
                                        TiposDeDiadema = "No aplica";
                                }
                                if ( LicenciaDeMarcadoras == undefined || LicenciaDeMarcadoras == "" ){
                                        LicenciaDeMarcadoras = "No aplica";
                                }


                         var data = {
                                id_place: (index+1),
                                timePeriod: cantidadPeriodos+" - "+TimePeriod,
                                start_date: fechaInicio,
                                end_Date: FechaFinal,
                                puestoDeTrabajo:{
                                    name: PuestoDeTrabajo,
                                    cantidad: ( PuestoDeTrabajoCantidad != 0 || PuestoDeTrabajoCantidad != "" ) ? PuestoDeTrabajoCantidad : 0 ,
                                },
                                equipoDeComputo:{
                                    name: EquiposDeComputo,
                                    licencia: TiposDeLicencias 
                                },
                                tipoDediadema:{
                                    name: TiposDeDiadema,
                                    licencia: LicenciaDeMarcadoras 
                               }
                            };

                        var template = carShoppingtemplate(data);
                        $("#web-car-summary").append(template);

                                     /*::::Elementos Adicionales::::*/
                                        $(this).find("#adicionalesOm .aditional_").each(function(){
                                            console.warn("!!!!!!FALTAN LOS ELEMENTOS ADICIONALES!");
                                            var ElementoAdicionalNombre   = $(this).find("#select-additionalsElements").text(),
                                                ElementoAdicionalUnitario = $(this).find("#optionDataAdic_unitario").val(),
                                                ElementoAdicionalTotal    = $(this).find("#optionDataAdic_total").val();
                                        });
                                    /*::::Fin Elementos Adicionales::::*/
                    }else{
                        console.error("No podemos calcular nada Aún");
                    }
                });
        }

        $("body").on("click","#pay", function(event){
            //$(".pay").remove("input");
            event.preventDefault();
            var dataPayLatam = [
                    { name: "merchantId", value:"508029" },
                    { name: "accountId", value:"512321" },
                    { name: "description", value:"Realizando Pago" },
                    { name: "referenceCode", value:"brmtEST" },
                    { name: "amount", value:"7000000000" },
                    { name: "tax", value:"0" },
                    { name: "taxReturnBase", value:"0" },
                    { name: "currency", value:"COP" },
                    { name: "signature", value:"12c610fafab5645fce8f4c52c730997b" },
                    { name: "test", value:"1" },
                    { name: "buyerEmail", value:"test@test.com" },
                    { name: "responseUrl", value:"http://www.test.com/response" },
                    { name: "confirmationUrl", value:"http://www.test.com/confirmation" }
                        ];
                for (var i = 0; i <= dataPayLatam.length - 1; i++) {
                    var input_ = $("<input/>");
                         input_.attr("name", dataPayLatam[i].name);
                         input_.attr("type", "hidden");
                         input_.val(dataPayLatam[i].value);
                    console.info(dataPayLatam[i]);
                    $(".pay").append(input_);
                };

            $(".pay").submit();
            console.warn(dataPayLatam);

            /*var input1  = '<input name="merchantId"    type="hidden"  value="'+dataPayLatam.merchantId+'"   >';
            var input2  = '<input name="accountId"     type="hidden"  value="'+dataPayLatam.accountId+'" >';
            var input3  = '<input name="description"   type="hidden"  value="'+dataPayLatam.description+'"  >';
            var input4  = '<input name="referenceCode" type="hidden"  value="'+dataPayLatam.referenceCode+'" >';
            var input5  = '<input name="amount"        type="hidden"  value="'+dataPayLatam.amount+'"   >';
            var input6  = '<input name="tax"           type="hidden"  value="'+dataPayLatam.tax+'"  >';
            var input7  = '<input name="taxReturnBase" type="hidden"  value="'+dataPayLatam.taxReturnBase+'" >';
            var input8  = '<input name="currency"      type="hidden"  value="'+dataPayLatam.currency+'" >';
            var input9  = '<input name="signature"     type="hidden"  value="'+dataPayLatam.signature+'"  >';
            var input10 = '<input name="test"          type="hidden"  value="'+dataPayLatam.test+'" >';
            var input11 = '<input name="buyerEmail"    type="hidden"  value="'+dataPayLatam.buyerEmail+' >';
            var input12 = '<input name="responseUrl"   type="hidden"  value="'+dataPayLatam.responseUrl+'" >';
          var input13 = '<input name="confirmationUrl" type="hidden"  value="'+dataPayLatam.confirmationUrl+'" >';*/

            $(this).append();
        }); 



