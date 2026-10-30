create database TaskFlowHub;

create table TaskFlowUsers (
id SERIAL PRIMARY KEY,
"nameUser" varchar(255) not null,
"emailUser" varchar(255) not null unique,
"passwordUser" varchar(255) not null
);

select * from TaskFlowUsers;