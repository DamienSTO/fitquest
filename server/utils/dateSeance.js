function debutJour(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function estMemeJour(dateA, dateB = new Date()) {
  return debutJour(dateA).getTime() === debutJour(dateB).getTime();
}

function estJourFutur(dateSeance, reference = new Date()) {
  return debutJour(dateSeance).getTime() > debutJour(reference).getTime();
}

function estJourPasse(dateSeance, reference = new Date()) {
  return debutJour(dateSeance).getTime() < debutJour(reference).getTime();
}

module.exports = { debutJour, estMemeJour, estJourFutur, estJourPasse };
