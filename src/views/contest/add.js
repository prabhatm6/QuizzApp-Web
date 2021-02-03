import React, {Component} from 'react'
import {
    TheFooter,
    TheHeaderInner
} from '../../containers/index'
import configuration from '../../config';
import 'react-toastify/dist/ReactToastify.css';
import {reactLocalStorage} from 'reactjs-localstorage';
import $ from 'jquery';
import {
    CModal,
    CModalBody,
  } from '@coreui/react';
  import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import languages from '../../languages';


class AddContest extends Component {
	constructor(props) {
        super(props);
        this.state = {
        	searchTerm: '',
        	searchCategoryTerm: '',
        	filterBrandList:[],
        	filterCategoryList:[],
			categoryList: [],
			categoryListObj:[],
			categoryListSelected:[],
			categoryListObjDisplaySelected:[],
			brandList: [],
			brandListObj:[],
			brandListSelected:[],
			brandListObjDisplaySelected:[],
			fields:{title:'',description:'',saveToId:'',brandIds:'',playerType:'1',visibility:'2'},
			errors:{},
			openModel:false,
			items: [],
			focused: false,
			input: '',
			openModelCategory:false,
			openModelBrand:false,
            image:'avatars/placeholder-user.png',
            localArr:[],
		};
		this.searchUpdated = this.searchUpdated.bind(this)
		this.searchUpdatedCategory = this.searchUpdatedCategory.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
		this.handleRemoveItem = this.handleRemoveItem.bind(this);

	}


	componentDidMount(){

        $('.display-profile-pic').hide();
		let fields = this.state.fields;
		fields.language = 'English';
		this.setState({fields})


		fetch(configuration.baseURL+"category/categoryList", {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + reactLocalStorage.get('clientToken'),
                }
            }).then((response) =>{
	    	return response.json();
	    }).then((data)=> {
			var categoryList = data.data;
	   		this.setState({categoryList:categoryList,filterCategoryList:categoryList});
		});	




		fetch(configuration.baseURL+"brand/brand", {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + reactLocalStorage.get('clientToken'),
                }
            }).then((response) =>{
	    	return response.json();
	    }).then((data)=> {
			var brandList = data.data;
	   		this.setState({ brandList:brandList,filterBrandList:brandList});
		});		

	}

	handleCloseClick(e) {
        $('body').removeClass('modal-open');

        this.setState({
            openModelCategory:false,
            openModelBrand:false,
            searchTerm: '',
        	searchCategoryTerm: ''
        });
        this.searchUpdatedCategory('');
        this.searchUpdated('');
    }

	handleOpenCategoryModel()
	{
		$('body').addClass('modal-open');
		let categoryListSelecte = this.state.categoryListSelected;
		$('.categoryCheckbox').each(function() {
		    $(this).prop( "checked", categoryListSelecte.includes($(this).attr('id')) );
		});

		this.setState({openModelCategory:true});	
	}

	handleOpenBrandModel()
	{
		$('body').addClass('modal-open');
		let brandListSelected = this.state.brandListSelected;
		$('.brandCheckbox').each(function() {
		    $(this).prop( "checked", brandListSelected.includes($(this).attr('id')) );
		});

		this.setState({openModelBrand:true});
	}

	handleChangeCategory(catdata,maindata, e){  

		let categoryListObj = this.state.categoryListObj;
		if (e.target.checked) {
			categoryListObj = categoryListObj.filter(function(value, index, arr){ 
				if(value.categoryId !== catdata._id)
				{
					return value;
				}
			});

			categoryListObj.push({'categoryId':catdata._id,'mainLabelId':maindata.id,'name':catdata.name});
		}
		else
		{
			categoryListObj = categoryListObj.filter(function(value, index, arr){ 
				if(value.categoryId !== catdata._id)
				{
					return value;
				}
			});
		}
		this.setState({categoryListObj:categoryListObj});
    }

    handleSubmitCategory(e)
    {
    	let categoryListObj = this.state.categoryListObj;

		let categoryListSelected = [];
    	let displayArr = [];

    	for (var i = 0; i < categoryListObj.length; i++) {

			categoryListSelected.push(categoryListObj[i].categoryId);
    		var obj = {};
    		obj.categoryId = categoryListObj[i].categoryId;
    		obj.name = categoryListObj[i].name;
    		displayArr.push(obj);
    	}



    	this.setState({categoryListObjDisplaySelected:displayArr,categoryListSelected:categoryListSelected});

    	let fields = this.state.fields;
		fields.categoryIds=JSON.stringify(categoryListObj);
		this.setState({fields})
		this.setState({openModelCategory:false})

		let errors = {};		
		if(typeof categoryListObj === 'undefined' || categoryListObj.length === 0){
            errors["categoryIds"] = "Please select atleast one category";
        }
        this.setState({errors: errors});
        $('body').removeClass('modal-open');

        this.setState({
            searchTerm: '',
        	searchCategoryTerm: ''
        });
        this.searchUpdatedCategory('');
        this.searchUpdated('');

    }

    handleChangeBrand(maindata, e){   

    	let brandListObj = this.state.brandListObj;
		if (e.target.checked) {
			brandListObj = brandListObj.filter(function(value, index, arr){ 
				if(value.id !== maindata._id)
				{
					return value;
				}
			});

			brandListObj.push({id:maindata._id,name:maindata.name});
		}
		else
		{
			brandListObj = brandListObj.filter(function(value, index, arr){ 
				if(value.id !== maindata._id)
				{
					return value;
				}
			});
		}
		this.setState({brandListObj:brandListObj});

    }

	handleSubmitBrand(e)
    {
    	let brandListObj = this.state.brandListObj;

		let brandListSelected = [];
    	let displayArr = [];

    	for (var i = 0; i < brandListObj.length; i++) {

			brandListSelected.push(brandListObj[i].id);
    		var obj = {};
    		obj.id = brandListObj[i].id;
    		obj.name = brandListObj[i].name;
    		displayArr.push(obj);
    	}



    	this.setState({brandListObjDisplaySelected:displayArr,brandListSelected:brandListSelected});

    	

    	let fields = this.state.fields;
		fields.brandIds=brandListSelected.join()
		this.setState({fields})

		this.setState({openModelBrand:false});
		$('body').removeClass('modal-open');

		this.setState({
            searchTerm: '',
        	searchCategoryTerm: ''
        });
        this.searchUpdatedCategory('');
        this.searchUpdated('');
    }


    handleRemoveCategory(data,e){
    	let categoryListObj = this.state.categoryListObj;
    	let categoryListObjDisplaySelected = this.state.categoryListObjDisplaySelected;
    	let categoryListSelected = this.state.categoryListSelected;
    	categoryListObj = categoryListObj.filter(function(value, index, arr){ 
			if(value.categoryId !== data.categoryId)
			{
				return value;
			}
			else
			{
				$('#'+data.categoryId).prop('checked', false);
			}
		});
		categoryListSelected = categoryListSelected.filter(function(value, index, arr){ 
			if(value !== data.categoryId)
			{
				return value;
			}
		});

		categoryListObjDisplaySelected = categoryListObjDisplaySelected.filter(function(value, index, arr){ 
			if(value.categoryId !== data.categoryId)
			{
				return value;
			}
		});


    	this.setState({categoryListObj:categoryListObj,categoryListObjDisplaySelected:categoryListObjDisplaySelected,categoryListSelected:categoryListSelected});
		

		let fields = this.state.fields;
		fields.categoryIds=JSON.stringify(categoryListObj);
		this.setState({fields})

		let errors = {};		
		if(typeof categoryListObj === 'undefined' || categoryListObj.length === 0){
            errors["categoryIds"] = "Please select atleast one category";
        }
        this.setState({errors: errors});

    }


    handleRemoveBrand(data,e){
    	
    	let brandListObj = this.state.brandListObj;
    	let brandListObjDisplaySelected = this.state.brandListObjDisplaySelected;
    	let brandListSelected = this.state.brandListSelected;
    	brandListObj = brandListObj.filter(function(value, index, arr){ 
			if(value.id !== data.id)
			{
				return value;
			}
			else
			{
				$('#'+data.id).prop('checked', false);
			}
		});
		brandListSelected = brandListSelected.filter(function(value, index, arr){ 
			if(value !== data.id)
			{
				return value;
			}
		});

		brandListObjDisplaySelected = brandListObjDisplaySelected.filter(function(value, index, arr){ 
			if(value.id !== data.id)
			{
				return value;
			}
		});


    	this.setState({brandListObj:brandListObj,brandListObjDisplaySelected:brandListObjDisplaySelected,brandListSelected:brandListSelected});
		

		let fields = this.state.fields;
		fields.brandIds=JSON.stringify(brandListSelected);
		this.setState({fields})
    }


	handleChange(field, e){   
        let fields = this.state.fields;
        fields[field] = e.target.value;        
        this.setState({fields});


        let errors = {};
        if(field === 'title' && fields["title"].trim() === ''){
            errors["title"] = "Please enter title";
        }

        if(field === 'visibility' && !fields["visibility"]){
            errors["visibility"] = "Please select visibility";
        }

        if(field === 'playerType' && !fields["playerType"]){
            errors["playerType"] = "Please select player type";
        }
        this.setState({errors: errors});

    }

	
	handleSubmit(){
		let fields = this.state.fields;
        let errors = {};
        let formIsValid = true;
        
		fields.hashtag= this.state.items.join();


		this.setState({fields})

		var categoryArr = (fields['categoryIds']) ? JSON.parse(fields['categoryIds']) : [];


        if(fields["title"].trim() === ''){
            formIsValid = false;
            errors["title"] = "Please enter title";
        }


        if(!fields["visibility"]){
            formIsValid = false;
            errors["visibility"] = "Please select visibility";
        }

        if(!fields["playerType"]){
            formIsValid = false;
            errors["playerType"] = "Please select player type";
        }


        if(typeof categoryArr === 'undefined' || categoryArr.length === 0){
            formIsValid = false;
            errors["categoryIds"] = "Please select atleast one category";
        }

        this.setState({errors: errors});
        if(formIsValid){
        	// console.log(JSON.parse(reactLocalStorage.get('userData')).userId);
        	const data = new FormData();
        	data.append('title',this.state.fields.title);
        	data.append('description',this.state.fields.description);
        	data.append('hashtag',this.state.fields.hashtag);
        	data.append('language',this.state.fields.language);
        	data.append('visibility',this.state.fields.visibility);
        	data.append('createdBy',JSON.parse(reactLocalStorage.get('userData')).userId);
        	data.append('playerType',this.state.fields.playerType);
        	data.append('saveToId',this.state.fields.saveToId);
        	data.append('categoryIds',this.state.fields.categoryIds);
        	data.append('brandIds',this.state.fields.brandIds);
            if(this.state.fields.image === 'image'){
            	console.log(this.uploadInput.files)
                data.append('image', this.uploadInput.files[0]);
            } 
            // console.log(data);
            fetch(configuration.baseURL+"contest/contest", {
                method: "post",
                headers: {
					'contentType': "application/json",
                    'Authorization': 'Bearer ' + reactLocalStorage.get('clientToken'),
                },
                body:data
            }).then((response) => {
                return response.json();
            }).then((data) => {
                if(data.code === 200){
                	this.props.history.push({
					  pathname: '/tray/'+data.data._id,
					  state: { contest_id: data.data._id }
					})

                	// window.location.href = '/#/tray'
                }
                else
                {
                    return toast.error(data.message);
                }
                
            });
        }
	};


	handleInputChange(evt) {
		this.setState({ input: evt.target.value });
	}

	handleInputKeyDown(evt) {
		if ( evt.keyCode === 13 && evt.target.value.trim() !== '' ) {
		  const {value} = evt.target;
		  
		  this.setState(state => ({
			items: [...state.items, value],
			input: ''
		  }));
	}

	if ( this.state.items.length && evt.keyCode === 8 && !this.state.input.length ) {
	  this.setState(state => ({
			items: state.items.slice(0, state.items.length - 1)
		  }));
		}

	}

	handleRemoveItem(index) {
		return () => {
		  this.setState(state => ({
			items: state.items.filter((item, i) => i !== index)
		  }));
		  	
		}
	}

	handleUploadProfile(type, ev) {
        let fields = this.state.fields;
        fields['image'] = 'image';
        this.setState({fields});
        // console.log(this.uploadInput.files)
    }
    searchUpdated (term = '') {
    	if (term !== '') {
    		term = term.target.value;
    	}
    	let brandList = this.state.brandList;
    	
    	let filterBrandList = [];
    	filterBrandList = brandList.filter(function(value, index, arr){ 
			if((value.name).includes(term) || (value.name.toLowerCase()).includes(term) || (value.name.toUpperCase()).includes(term))
			{
				return value;
			}
		});
    	
    	if (term === '') {
    		filterBrandList = brandList;
    	}
	    this.setState({searchTerm: term,filterBrandList:filterBrandList});
	}

	searchUpdatedCategory(term = '') {
		if (term !== '') {
    		term = term.target.value;
    	}

    	let filterCategoryList = [];
    	if (term) {  

    		fetch(configuration.baseURL+"category/categoryList", {
	                method: "GET",
	                headers: {
	                    'Accept': 'application/json',
	                    'Content-Type': 'application/json',
	                    'Authorization': 'Bearer ' + reactLocalStorage.get('clientToken'),
	                }
	            }).then((response) =>{
		    	return response.json();
		    }).then((data)=> {
				var categoryList1 = data.data;
		    	for (var i = 0; i < categoryList1.length; i++) {
		    		var innerArr = []
		    		for (var k = 0; k < categoryList1[i].categories.length; k++) {
		    			var name = categoryList1[i].categories[k].name;
		    			if(name.includes(term) || (name.toLowerCase()).includes(term) || (name.toUpperCase()).includes(term))
						{
							innerArr.push(categoryList1[i].categories[k]);
						}
		    		}
		    		if (innerArr.length > 0) {
		    			var obj = {};
		    			obj = categoryList1[i];
		    			obj.categories = innerArr;
		    			filterCategoryList.push(obj);
		    		}    	
		    	} 
		    	this.setState({searchCategoryTerm: term,filterCategoryList:filterCategoryList});
			});	

    		
	    }
	    else
	    {
	    	fetch(configuration.baseURL+"category/categoryList", {
	                method: "GET",
	                headers: {
	                    'Accept': 'application/json',
	                    'Content-Type': 'application/json',
	                    'Authorization': 'Bearer ' + reactLocalStorage.get('clientToken'),
	                }
	            }).then((response) =>{
		    	return response.json();
		    }).then((data)=> {
				var category = data.data;
				this.setState({searchCategoryTerm: term,filterCategoryList:category});
			});	
	    	
	    }

	    
	}


	


	render() {
		$(document).ready(function() {
            var readURL = function(input) {
				if (input.files && input.files[0]) {
					var reader = new FileReader();
					reader.onload = function (e) {
						// console.log(e.target.result);
						$('.display-profile-pic').attr('src', e.target.result);
						$('.display-profile-pic').show();
						$('#start').hide();
					}
					reader.readAsDataURL(input.files[0]);
				}
            }
            $(".file-upload").on('change', function(){
            	readURL(this);
            });
            $(".upload-button").on('click', function() {
            	$(".file-upload").click();
            });
        });

		return (
			<>
				<TheHeaderInner />				
					<main id="main">
					<ToastContainer position="top-right" autoClose={5000} style={{top:'80px'}}/>

					<div className={(this.state.openModelCategory) ? 'stopScorll' : ''}>
						<CModal className="model" size="lg" show={this.state.openModelCategory} closeOnBackdrop={false}  onClose={this.handleCloseClick.bind(this) }  color="danger"  centered>
	                    	<CModalBody className="model-bg">

		                    <div>
		                        <div className="modal-body">
		                            <button type="button" className="close"  onClick={this.handleCloseClick.bind(this) } >
		                            <span aria-hidden="true"><img src="./murabbo/img/close.svg" /></span>
		                        </button>
		                            <div className="model_data">
		                                <div className="model-title">
			                                <h3>Choose Category</h3>
		                                </div>
		                                <div className="contest">

		                                	<div class="col-12 search search-brand-cat" style={{marginBottom:'20px'}}>
				                                <input type="text" placeholder="Search by keywords"  value={this.state.searchCategoryTerm} onChange={this.searchUpdatedCategory.bind(this)}  /><i className='bx bx-search' ></i>
			                                </div>
									        {
									        	this.state.filterCategoryList.map((e, key) => {
															
														return  <div className="row">
								                            <div className="col-8">
								                                <div className="cate-title">
								                                    <p>{e.title}</p>
								                                </div>
								                            </div>
								                            <div className="col-4">
								                                {/*<div className="seeall">
								                                    <p>See All</p>
								                                </div>*/}
								                            </div>

								                            { e.categories.map((cat, ckey) => {
								                            return <div className="col-lg-2 col-md-3 col-sm-3 checkbox-buttons-container">
										                        <input type="checkbox" className='categoryCheckbox' id={cat._id}    onChange={this.handleChangeCategory.bind(this,cat,e)} />
										                        <label for={cat._id}>
										                            <div style={{ marginBottom: '0' }} className="cate-box">
										                                <img src={cat.image} />
										                                <div className="cat_title">
										                                    <h3 style={{fontSize: '11px'}}>{cat.name}</h3>
										                                </div>
										                            </div>
										                        </label>
										                    </div>
								                            })
								                        }
								                        </div>
						                        	})
						                    }


						                    
						                    <div style={{ textAlign: 'center' }} class="">
							                    <button class="blue_btn" type="button"  onClick={this.handleSubmitCategory.bind(this)} >Done</button>
							                </div>
								        </div>
		                            </div>
		                        </div>
		                        </div>
		                    </CModalBody>
		                </CModal>
	                </div>
	                <div className={(this.state.openModelBrand) ? 'stopScorll' : ''}>
		                <CModal size="lg" show={this.state.openModelBrand} closeOnBackdrop={false}  onClose={this.handleCloseClick.bind(this) }  aria-hidden="true" color="danger"  centered>
	                    	<CModalBody className="model-bg">

		                    <div>
		                        <div className="modal-body">
		                            <button type="button" className="close"  onClick={this.handleCloseClick.bind(this) } >
		                            <span aria-hidden="true"><img src="./murabbo/img/close.svg" /></span>
		                        </button>
		                            <div className="model_data">
		                                <div className="model-title">
			                                <h3>Choose Brand</h3>
		                                </div>
		                                <div className="contest">
		                                	<div className="row">
		                                	<div class="col-12 search search-brand-cat" style={{marginBottom:'20px'}}>
				                                <input type="text" value={this.state.searchTerm} placeholder="Search by keywords" onChange={this.searchUpdated.bind(this)} /><i className='bx bx-search' ></i>
			                                </div>

						                    {

						                    	this.state.filterBrandList.map((brand, key) => {
								                            return <div className="col-lg-2 col-md-3 col-sm-3 checkbox-buttons-container brand">
										                        <input className="brandCheckbox" type="checkbox" id={brand._id} onChange={this.handleChangeBrand.bind(this,brand)} />
										                        <label for={brand._id}>
										                            <div style={{ marginBottom: '0' }} className=" cate-box">
										                                <img src={brand.image} />
										                                <div className="cat_title">
										                                    <h3>{brand.name}</h3>
										                                </div>
										                            </div>
										                        </label>
										                    </div>
										                })
						                    }
								        	</div>

						                    <div style={{ marginTop:"25px",textAlign: 'center' }} class="">
							                    <button class="blue_btn" type="button"  onClick={this.handleSubmitBrand.bind(this)} >Done</button>
							                </div>
								        </div>
		                            </div>
		                        </div>
		                        </div>
		                    </CModalBody>
		                </CModal>
	                </div>
					
			            <section id="contest" className="d-flex align-items-center">
			                <div className="container">
			                    <div className="create-contest">
			                        <div className="contest-title">
			                            <div className="row">
			                                <div className="col-md-4">
			                                    <div className="main_title">
			                                        <h3>Create Contest</h3>  
			                                    </div> 
			                                </div>
			                                {/*<div className="col-md-8">
			                                    <ul className="title-link">
			                                        <a href="javascript:void(0);"><li><img src="./murabbo/img/close2.svg" alt="Murabbo" /> Remove</li></a>
			                                        <a href="javascript:void(0);"><li><img style={{width: '17px'}} src="./murabbo/img/send.svg" alt="Murabbo" /> Publish</li></a>
			                                        <a href="javascript:void(0);"><li><img src="./murabbo/img/edit.svg" alt="Murabbo" /> Edit</li></a>
			                                    </ul>  
			                                </div>*/}
			                            </div>
			                        </div>
			                    </div>
			                    <div className="contest-info">
			                        <div className="row">
			                            <div className="col-md-8 offset-md-2">
			                                <div className="progressbar">
			                                    <div className="inner-progress">
			                                        <p>Contest Info</p>
			                                    </div>
			                                </div>
			                            </div>
			                            <div className="col-lg-4 col-md-6 col-sm-12">
			                                <div className="profile-img">
			                                    <form id="file-upload-form" className="uploader">
			                                      <input id="file-upload" type="file" name="fileUpload" className="file-upload" accept="image/*" onChange={this.handleUploadProfile.bind(this,'image')} ref={(ref) => { this.uploadInput = ref; }}  />

			                                      <label for="file-upload" id="file-drag">
			                                        <img id="file-image"   src="#" alt="Preview" className="hidden"/>
			                                        <img className="display-profile-pic" src='' alt=""  />
			                                        <div id="start">
													  <img className="profile-pic" src='./murabbo/img/upload.svg' alt=""  />
			                                          <div id="notimage">Please select an image</div>
			                                          <div id="add_image">Add Image</div>
			                                        </div>
			                                        <div id="response" className="hidden">
			                                          <div id="messages"></div>
			                                          
			                                        </div>
			                                      </label>
			                                    </form>
			                                </div>
			                                <span style={{top:'0'}} className="error-msg">{this.state.errors["image"]}</span>
			                            </div>
			                            <div className="col-lg-4 col-md-6 col-sm-12">
										
											<div className="cus_input input_wrap">
												<img src="./murabbo/img/title.svg" /> 
												<input required type="text"  onChange={this.handleChange.bind(this, "title")} value={this.state.fields["title"]}/>
												<label>Title</label>
											</div> 
											<span className="error-msg">{this.state.errors["title"]}</span>

			                                <div className="cus_input input_wrap">
			                                    <img src="./murabbo/img/des.svg" alt="Murabbo"/> <input required type="text"  onChange={this.handleChange.bind(this, "description")} value={this.state.fields["description"]}/>
			                                    <label>Description</label>
			                                </div>
											<span className="error-msg">{this.state.errors["description"]}</span>

			                                <div className="cus_input input_wrap">
												<img src="./murabbo/img/hashtag.svg" alt="Murabbo"/>
												<input type="text" required value={this.state.input} onChange={this.handleInputChange} onKeyDown={this.handleInputKeyDown}  />
												<label>Hashtag</label>
			                                </div>
											<div className="add-category" >
												{this.state.items.map((item, i) => 

													<div className="category" style={{ 
														marginRight: '5px',marginTop: '-15px'
													}}>
														<p>{item} <img src="./murabbo/img/closewhite.svg" onClick={this.handleRemoveItem(i)} alt="Murabbo"/></p>
													</div>
												)}
											</div>
											<span className="error-msg">{this.state.errors["hashtag"]}</span>
			                                <div className="cus_input input_wrap floating-label" >
			                                    <img src="./murabbo/img/global.svg" alt="Murabbo"/> 
			                                    
												<select className="floating-select" onChange={this.handleChange.bind(this,'language')} value={this.state.fields.language} required>
							                      	{
		                                                languages.languages.map((e, key) => {
		                                                    return <option value={e.name}>{e.name} </option>;
		                                                })
		                                            }
			                                    </select>
			                                    <span className="highlight"></span>
			                                    <label>Language</label>
			                                </div>
			                                <span className="error-msg">{this.state.errors["language"]}</span>
			                            </div>
			                            <div className="col-lg-4 col-md-6 col-sm-12">
			                                <div className="cus_input input_wrap">
			                                    <img src="./murabbo/img/saveto.svg" alt="Murabbo"/> 
			                                    <select className="floating-select" onChange={this.handleChange.bind(this,'saveToId')} value={this.state.fields.saveToId} required>
							                      	<option value=""></option>
							                      	<option value="Personal">Personal</option>
							                      	<option value="Favourite">Favourite</option>
							                      	<option value="Important">Important</option>
							                      	<option value="Education">Education</option>
			                                    </select>
			                                    <label>Save To</label>
			                                </div>
											<span className="error-msg">{this.state.errors["saveToId"]}</span>

											<div style={{margin: '0px 0 5px 0'}} className="cus_input ">
			                                    <img src="./murabbo/img/enable.svg" alt="Murabbo"/> <label className="cus_label">Player Type</label>
			                                </div>
			                                <label className="control control--radio">Single
												<input type="radio" name="radio1" value="1"  onChange={this.handleChange.bind(this, "playerType")} checked={(this.state.fields.playerType === '1' ? 'checked' : '')}/>
			                                  <div className="control__indicator"></div>
			                                </label>
			                                <label className="control control--radio">Multiplayer
			                                  <input type="radio" name="radio1" value="2"  onChange={this.handleChange.bind(this, "playerType")} checked={(this.state.fields.playerType === '2' ? 'checked' : '')}/>
			                                  <div className="control__indicator"></div>
			                                </label>
			                                <label>
											<span className="error-msg">{this.state.errors["playerType"]}</span>
											</label>

			                                <div style={{margin: '0px 0 5px 0'}} className="cus_input ">
			                                    <img src="./murabbo/img/enable.svg" alt="Murabbo"/> <label className="cus_label">Visibility</label>
			                                </div>
			                                <label className="control control--radio">All
												<input type="radio" name="radio" value="2"  onChange={this.handleChange.bind(this, "visibility")} checked={(this.state.fields.visibility === '2' ? 'checked' : '')}/>
			                                  <div className="control__indicator"></div>
			                                </label>
			                                <label className="control control--radio">Only Me
			                                  <input type="radio" name="radio" value="1"  onChange={this.handleChange.bind(this, "visibility")} checked={(this.state.fields.visibility === '1' ? 'checked' : '')}/>
			                                  <div className="control__indicator"></div>
			                                </label>
			                                <label>
											<span className="error-msg">{this.state.errors["visibility"]}</span>
											</label>
			                                <div className="add-category">
			                                    <label>Choose Category <img src="./murabbo/img/add.svg" alt="Murabbo" onClick={this.handleOpenCategoryModel.bind(this)} /></label><br />

			                                    { this.state.categoryListObjDisplaySelected.map((e, key) => {
				                                		return <div className="category" style={{ 
														marginRight: '5px'
													}}>
					                                        <p>{e.name}<img src="./murabbo/img/closewhite.svg" alt="Murabbo" onClick={this.handleRemoveCategory.bind(this,e)}/></p>
					                                    </div>
				                                    })
				                                }
			                                    	
			                                </div>
			                                <span style={{top:'0'}} className="error-msg">{this.state.errors["categoryIds"]}</span>
			                                <div className="add-category">
			                                    <label>Choose Brand <img src="./murabbo/img/add.svg" alt="Murabbo" onClick={this.handleOpenBrandModel.bind(this)}  /></label><br />

			                                    { this.state.brandListObjDisplaySelected.map((e, key) => {
				                                		return <div className="category" style={{ 
														marginRight: '5px'
													}}>
					                                        <p>{e.name}<img src="./murabbo/img/closewhite.svg" alt="Murabbo" onClick={this.handleRemoveBrand.bind(this,e)}/></p>
					                                    </div>
				                                    })
				                                }
			                                </div>
			                                <span style={{top:'0'}} className="error-msg">{this.state.errors["brandIds"]}</span>
			                            </div>
			                        </div>
			                    </div>
			                    <div className="contest-info">
			                        <div className="contest-title">
			                            <div className="row">
			                                <div className="col-md-12">
			                                    <div className="footer-btn">
			                                        <button className="blue_btn" type="button" onClick={this.handleSubmit.bind(this)}>Save & Next</button>
			                                    </div> 
			                                </div>
			                            </div>
			                        </div>
			                    </div>
			                </div>
			            </section>
			        </main>
		        <TheFooter />
		    </>
		)
	}
}

export default AddContest
