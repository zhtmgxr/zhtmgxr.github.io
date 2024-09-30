<!DOCTYPE html>
<html lang="en">
<head>
  <title>Samrat Image Gallery</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>
  <link href='simplelightbox-master/dist/simplelightbox.min.css' rel='stylesheet' type='text/css'>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script type="text/javascript" src="simplelightbox-master/dist/simple-lightbox.jquery.min.js"></script>

<style>
    .container .gallery a img {
  float: left;
  width: 20%;
  height: auto;
  border: 2px solid #fff;
  -webkit-transition: -webkit-transform .15s ease;
  -moz-transition: -moz-transform .15s ease;
  -o-transition: -o-transform .15s ease;
  -ms-transition: -ms-transform .15s ease;
  transition: transform .15s ease;
  position: relative;
}

.container .gallery a:hover img {
  -webkit-transform: scale(1.05);
  -moz-transform: scale(1.05);
  -o-transform: scale(1.05);
  -ms-transform: scale(1.05);
  transform: scale(1.05);
  z-index: 5;
}

.clear {
  clear: both;
  float: none;
  width: 100%;
}
</style>

</head>
<body>
<div class='container'>
 <div class="gallery">
 
  <?php 
  // Image extensions
  $image_extensions = array("png","jpg","jpeg","gif");

  // Target directory
  $dir = 'images/';
  if (is_dir($dir)){
 
   if ($dh = opendir($dir)){
    $count = 1;

    // Read files
    while (($file = readdir($dh)) !== false){

     if($file != '' && $file != '.' && $file != '..'){
 
      // Thumbnail image path
      $thumbnail_path = "images/".$file;

      // Image path
      $image_path = "images/".$file;
 
      $thumbnail_ext = pathinfo($thumbnail_path, PATHINFO_EXTENSION);
      $image_ext = pathinfo($image_path, PATHINFO_EXTENSION);

      // Check its not folder and it is image file
      if(!is_dir($image_path) && 
         in_array($thumbnail_ext,$image_extensions) && 
         in_array($image_ext,$image_extensions)){
   ?>

       <!-- Image -->
       <a href="<?php echo $image_path; ?>">
        <img src="<?php echo $thumbnail_path; ?>" alt="" title=""/>
       </a>
       <!-- --- -->
       <?php

       // Break
       if( $count%4 == 0){
       ?>
         <div class="clear"></div>
       <?php 
       }
       $count++;
      }
     }
 
    }
    closedir($dh);
   }
  }
 ?>
 </div>
</div>
<!-- Script -->
<script type='text/javascript'>
$(document).ready(function(){

 // Intialize gallery
 var gallery = $('.gallery a').simpleLightbox();

});
</script>
</body>
</html>