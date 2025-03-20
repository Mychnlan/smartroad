        let alternatives = [];
        let criteria = ["Volume Lalu Lintas", "Tingkat Kecelakaan", "Kondisi Jalan", "Aksesibilitas"];
        let weights = [];

        async function loadWeights() {
            try {
                let response = await fetch("bobot.json");
                let data = await response.json();
                weights = data.weights;
                console.log("Bobot AHP dimuat:", weights);
            } catch (error) {
                console.error("Gagal memuat bobot AHP", error);
            }
        }

        function addAlternative() {
            let name = document.getElementById("altName").value;
            let values = criteria.map((c, i) => parseFloat(document.getElementById(`criteria${i}`).value));
            
            if (!name || values.some(isNaN)) {
                alert("Harap isi semua bidang dengan benar!");
                return;
            }
            
            alternatives.push({ name, values });
            document.getElementById("altName").value = "";
            criteria.forEach((_, i) => document.getElementById(`criteria${i}`).value = "");
            displayAlternatives();
        }

        function displayAlternatives() {
            document.getElementById("altList").innerHTML = alternatives.map((alt, i) => `<p>${i+1}. ${alt.name} - [${alt.values.join(", ")}]</p>`).join('');
        }

        function normalizeMatrix(matrix, criteriaType) {
            let numCriteria = matrix[0].length;
            let normalizedMatrix = matrix.map(row => [...row]);
            for (let j = 0; j < numCriteria; j++) {
                let column = matrix.map(row => row[j]); 
                let maxVal = Math.max(...column);
                let minVal = Math.min(...column);
                for (let i = 0; i < matrix.length; i++) {
                    normalizedMatrix[i][j] = (criteriaType[j] === 'benefit')
                        ? matrix[i][j] / maxVal
                        : minVal / matrix[i][j];
                }
            }
            return normalizedMatrix;
        }

        function sawRanking(matrix, weights) {
            return matrix.map(row => row.reduce((sum, val, j) => sum + (val * weights[j]), 0));
        }

        function calculate() {
            if (alternatives.length < 2) {
                alert("Tambahkan minimal 2 alternatif!");
                return;
            }
            let decisionMatrix = alternatives.map(a => a.values);
            let criteriaType = ['benefit', 'cost', 'benefit', 'benefit'];
            let normalizedMatrix = normalizeMatrix(decisionMatrix, criteriaType);
            let scores = sawRanking(normalizedMatrix, weights);
            let results = alternatives.map((alt, i) => ({ name: alt.name, score: scores[i] }))
                                    .sort((a, b) => b.score - a.score);
            document.getElementById("result").innerHTML = results.map((res, i) => `<p>${i+1}. ${res.name} - Skor: ${res.score.toFixed(3)}</p>`).join('');
        }

        window.onload = loadWeights;