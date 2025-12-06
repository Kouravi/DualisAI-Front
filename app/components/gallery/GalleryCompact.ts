const galleryHome = [
    { src: "/samples/pets/dog1.jpg", modelo: "mascota" },
    { src: "/samples/pets/dog2.jpg", modelo: "mascota" },
    { src: "/samples/pets/dog3.jpg", modelo: "mascota" },
    { src: "/samples/pets/cat1.jpeg", modelo: "mascota" },
    { src: "/samples/pets/cat2.jpg", modelo: "mascota" },
    { src: "/samples/pets/cat3.jpg", modelo: "mascota" },
    { src: "/samples/human/men1.jpg", modelo: "humano" },
    { src: "/samples/human/men2.jpg", modelo: "humano" },
    { src: "/samples/human/men3.jpg", modelo: "humano" },
    { src: "/samples/human/men4.jpg", modelo: "humano" },
    { src: "/samples/human/women1.jpg", modelo: "humano" },
    { src: "/samples/human/women2.jpg", modelo: "humano" },
    { src: "/samples/human/women3.jpg", modelo: "humano" },
    { src: "/samples/human/women4.jpg", modelo: "humano" },
];


function getRandomItems(list: any[], count: number) {
    return [...list].sort(() => Math.random() - 0.5).slice(0, count);
}

export const galleryCompactHome = (() => {
    const humanos = galleryHome.filter(i => i.modelo === "humano");
    const mascotas = galleryHome.filter(i => i.modelo === "mascota");

    const seleccionHumanos = getRandomItems(humanos, 2);
    const seleccionMascotas = getRandomItems(mascotas, 2);

    return [...seleccionHumanos, ...seleccionMascotas]
        .sort(() => Math.random() - 0.5);
})();