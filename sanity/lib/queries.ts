import { groq } from "next-sanity";

export const allLeadersQuery = groq`*[_type == "leader"]|order(name asc){
  _id,
  name,
  role,
  section,
  slug,
  bio,
  "photo": photo.asset->url
}`;

export const sectionsQuery = groq`*[_type == "section"]|order(title asc){
  _id,
  title,
  slug,
  ageRange,
  motto,
  meeting,
  description,
  focusAreas,
  "heroImage": heroImage.asset->url,
  chief->{_id, name, role, "photo": photo.asset->url},
  assistants[]->{_id, name, role, "photo": photo.asset->url},
  patrols
}`;
