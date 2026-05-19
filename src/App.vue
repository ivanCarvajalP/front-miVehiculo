<template>
  <router-view></router-view>
</template>

<script setup>
</script>

<style>
/* Estilos Globales de la App */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #f1f5f9;
}
* {
  box-sizing: border-box;
}


.view-fade { 
  animation: fadeIn 0.3s ease; 
}
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}
</style>
