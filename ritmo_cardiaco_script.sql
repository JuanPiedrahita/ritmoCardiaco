-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler  version: 0.9.1-beta1
-- PostgreSQL version: 10.0
-- Project Site: pgmodeler.io
-- Model Author: ---


-- Database creation must be done outside an multicommand file.
-- These commands were put in this file only for convenience.
-- -- object: ritmo_cardiaco | type: DATABASE --
-- -- DROP DATABASE IF EXISTS ritmo_cardiaco;
-- CREATE DATABASE ritmo_cardiaco;
-- -- ddl-end --
-- 

-- object: public.paciente | type: TABLE --
-- DROP TABLE IF EXISTS public.paciente CASCADE;
CREATE TABLE public.paciente(
	id serial NOT NULL,
	documento integer NOT NULL,
	nombre varchar(50) NOT NULL,
	apellido varchar(50) NOT NULL,
	edad integer NOT NULL,
	peso numeric(3,2) NOT NULL,
	estatura numeric(3,2) NOT NULL,
	CONSTRAINT pk_paciente PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.paciente OWNER TO postgres;
-- ddl-end --

-- object: public.contacto | type: TABLE --
-- DROP TABLE IF EXISTS public.contacto CASCADE;
CREATE TABLE public.contacto(
	id serial NOT NULL,
	paciente integer NOT NULL,
	correo varchar NOT NULL,
	telefono integer,
	direccion varchar(50),
	CONSTRAINT pk_contacto PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.contacto OWNER TO postgres;
-- ddl-end --

-- object: public.medicion_ritmo_cardiaco | type: TABLE --
-- DROP TABLE IF EXISTS public.medicion_ritmo_cardiaco CASCADE;
CREATE TABLE public.medicion_ritmo_cardiaco(
	id serial NOT NULL,
	paciente integer,
	valor integer NOT NULL,
	tiempo integer NOT NULL,
	fecha timestamp NOT NULL,
	CONSTRAINT pk_medicion_ritmo_cardiaco PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.medicion_ritmo_cardiaco OWNER TO postgres;
-- ddl-end --

-- object: public.diagnostico | type: TABLE --
-- DROP TABLE IF EXISTS public.diagnostico CASCADE;
CREATE TABLE public.diagnostico(
	id serial NOT NULL,
	paciente integer,
	fecha timestamp NOT NULL,
	diagnostico text NOT NULL,
	CONSTRAINT pk_diagnostico PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.diagnostico OWNER TO postgres;
-- ddl-end --

-- object: paciente_fk | type: CONSTRAINT --
-- ALTER TABLE public.contacto DROP CONSTRAINT IF EXISTS paciente_fk CASCADE;
ALTER TABLE public.contacto ADD CONSTRAINT paciente_fk FOREIGN KEY (paciente)
REFERENCES public.paciente (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: paciente_fk | type: CONSTRAINT --
-- ALTER TABLE public.medicion_ritmo_cardiaco DROP CONSTRAINT IF EXISTS paciente_fk CASCADE;
ALTER TABLE public.medicion_ritmo_cardiaco ADD CONSTRAINT paciente_fk FOREIGN KEY (paciente)
REFERENCES public.paciente (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: paciente_fk | type: CONSTRAINT --
-- ALTER TABLE public.diagnostico DROP CONSTRAINT IF EXISTS paciente_fk CASCADE;
ALTER TABLE public.diagnostico ADD CONSTRAINT paciente_fk FOREIGN KEY (paciente)
REFERENCES public.paciente (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --


